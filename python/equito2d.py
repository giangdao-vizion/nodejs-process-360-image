import cv2
import numpy as np
import math
import sys
import os
from PIL import Image

def equirectangular_to_rectilinear(img, fov=90, yaw=0, pitch=0, out_w=4000, out_h=4000):
    """
    Convert equirectangular panorama to rectilinear perspective projection.
    img   : input equirectangular image (OpenCV BGR)
    fov   : field of view in degrees (horizontal)
    yaw   : rotation around vertical axis in degrees
    pitch : rotation around horizontal axis in degrees
    out_w : output width
    out_h : output height
    """
    h, w = img.shape[:2]

    # Convert angles to radians
    fov = math.radians(fov)
    yaw = math.radians(yaw)
    pitch = math.radians(pitch)

    # Focal length from FOV
    fx = out_w / (2 * math.tan(fov / 2))
    fy = fx

    # Build coordinate grid
    x = np.linspace(-out_w/2, out_w/2, out_w).astype(np.float32)
    y = np.linspace(-out_h/2, out_h/2, out_h).astype(np.float32)
    xv, yv = np.meshgrid(x, y)

    # Directions in camera space (flip fixed with -yv)
    z = fx
    dirs = np.stack((xv, -yv, np.full_like(xv, z)), axis=-1)
    dirs = dirs / np.linalg.norm(dirs, axis=-1, keepdims=True)

    # Rotation: yaw then pitch
    Ry = np.array([
        [ math.cos(yaw), 0, math.sin(yaw)],
        [ 0, 1, 0],
        [-math.sin(yaw), 0, math.cos(yaw)]
    ])

    Rx = np.array([
        [1, 0, 0],
        [0, math.cos(pitch), -math.sin(pitch)],
        [0, math.sin(pitch),  math.cos(pitch)]
    ])

    R = Rx @ Ry
    dirs = dirs @ R.T

    # Convert 3D direction → spherical coords
    lon = np.arctan2(dirs[...,0], dirs[...,2])
    lat = np.arcsin(dirs[...,1])

    # Map lon/lat → equirectangular pixel coords
    map_x = (lon / (2*math.pi) + 0.5) * w
    map_y = (0.5 - lat / math.pi) * h

    map_x = map_x.astype(np.float32)
    map_y = map_y.astype(np.float32)

    # Remap image using high-quality Lanczos
    persp = cv2.remap(img, map_x, map_y, cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_WRAP)
    return persp


def sharpen_image(img):
    """Apply sharpening filter"""
    kernel = np.array([[0,-1,0],
                       [-1,5,-1],
                       [0,-1,0]])
    return cv2.filter2D(img, -1, kernel)


def save_image(path, img):
    """Save image with best quality depending on extension.
       If .tif → save 16-bit TIFF + also a JPEG copy.
    """
    ext = os.path.splitext(path)[1].lower()

    if ext in [".jpg", ".jpeg"]:
        cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, 100])  # max quality

    elif ext == ".png":
        cv2.imwrite(path, img, [cv2.IMWRITE_PNG_COMPRESSION, 0])  # no compression

    elif ext == ".tif" or ext == ".tiff":
        # Ensure values are 16-bit
        tif_output = np.clip(img, 0, 255).astype(np.uint16) * 257  # upscale 8-bit → 16-bit

        # Pillow expects RGB 16-bit as mode "I;16" only for single channel,
        # so we must ensure it's handled as RGB
        Image.fromarray(tif_output, mode="RGB").save(path, compression="tiff_deflate")
        # cv2.imwrite(path, tif_output)

        # Also save JPEG copy
        jpg_path = os.path.splitext(path)[0] + ".jpg"
        cv2.imwrite(jpg_path, img, [cv2.IMWRITE_JPEG_QUALITY, 100])
        print(f"✅ Saved TIFF (16-bit): {path}")
        print(f"✅ Also saved JPEG (8-bit): {jpg_path}")
        return

    else:
        cv2.imwrite(path, img)  # fallback

    print(f"✅ Saved {path}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python equirect_to_rectilinear.py input.jpg output.(jpg|png|tif) [fov yaw pitch out_w out_h]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    fov   = float(sys.argv[3]) if len(sys.argv) > 3 else 90
    yaw   = float(sys.argv[4]) if len(sys.argv) > 4 else 0
    pitch = float(sys.argv[5]) if len(sys.argv) > 5 else 0
    out_w = int(sys.argv[6]) if len(sys.argv) > 6 else 4000
    out_h = int(sys.argv[7]) if len(sys.argv) > 7 else 4000

    img = cv2.imread(input_path, cv2.IMREAD_COLOR)
    if img is None:
        print("❌ Failed to load", input_path)
        sys.exit(1)

    result = equirectangular_to_rectilinear(img, fov, yaw, pitch, out_w, out_h)
    result = sharpen_image(result)  # Apply sharpening

    save_image(output_path, result)