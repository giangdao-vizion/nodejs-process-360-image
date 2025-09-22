import cv2
import numpy as np
import math
import sys
import os
from PIL import Image

def equirectangular_to_rectilinear(img, fov=90, yaw=0, pitch=0, out_w=4000, out_h=4000):
    h, w = img.shape[:2]

    # Convert angles to radians
    fov = math.radians(fov)
    yaw = math.radians(yaw)
    pitch = math.radians(pitch)

    # Focal length
    fx = out_w / (2 * math.tan(fov / 2))
    fy = fx

    # Grid
    x = np.linspace(-out_w/2, out_w/2, out_w).astype(np.float32)
    y = np.linspace(-out_h/2, out_h/2, out_h).astype(np.float32)
    xv, yv = np.meshgrid(x, y)

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

    # 3D → spherical
    lon = np.arctan2(dirs[...,0], dirs[...,2])
    lat = np.arcsin(dirs[...,1])

    map_x = (lon / (2*math.pi) + 0.5) * w
    map_y = (0.5 - lat / math.pi) * h

    map_x = map_x.astype(np.float32)
    map_y = map_y.astype(np.float32)

    persp = cv2.remap(img, map_x, map_y, cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_WRAP)
    return persp


def sharpen_image(img):
    kernel = np.array([[0,-1,0],
                       [-1,5,-1],
                       [0,-1,0]])
    return cv2.filter2D(img, -1, kernel)


def save_image(path, img):
    ext = os.path.splitext(path)[1].lower()

    if ext in [".jpg", ".jpeg"]:
        cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, 100])

    elif ext == ".png":
        cv2.imwrite(path, img, [cv2.IMWRITE_PNG_COMPRESSION, 0])

    elif ext in [".tif", ".tiff"]:
        tif_output = np.clip(img, 0, 255).astype(np.uint16) * 257
        Image.fromarray(tif_output, mode="RGB").save(path, compression="tiff_deflate")

        jpg_path = os.path.splitext(path)[0] + ".jpg"
        cv2.imwrite(jpg_path, img, [cv2.IMWRITE_JPEG_QUALITY, 100])
        print(f"✅ Saved TIFF (16-bit): {path}")
        print(f"✅ Also saved JPEG (8-bit): {jpg_path}")
        return

    else:
        cv2.imwrite(path, img)

    print(f"✅ Saved {path}")


def crop_pieces(img, output_path, widths):
    h, w = img.shape[:2]
    num = len(widths)
    centers = np.linspace(0, w, num+2)[1:-1]  # evenly spaced centers inside the image

    base, ext = os.path.splitext(output_path)
    for i, (pw, cx) in enumerate(zip(widths, centers), start=1):
        left = int(cx - pw/2)
        right = int(cx + pw/2)
        left = max(0, left)
        right = min(w, right)
        crop = img[:, left:right]

        piece_path = f"{base}-{i}{ext}"
        save_image(piece_path, crop)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python equirect_to_rectilinear.py input.jpg output.(jpg|png|tif) [fov yaw pitch out_w out_h piece_w1 piece_w2 ...]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    fov   = float(sys.argv[3]) if len(sys.argv) > 3 else 90
    yaw   = float(sys.argv[4]) if len(sys.argv) > 4 else 0
    pitch = float(sys.argv[5]) if len(sys.argv) > 5 else 0
    out_w = int(sys.argv[6]) if len(sys.argv) > 6 else 4000
    out_h = int(sys.argv[7]) if len(sys.argv) > 7 else 4000

    piece_widths = [int(x) for x in sys.argv[8:]] if len(sys.argv) > 8 else []

    img = cv2.imread(input_path, cv2.IMREAD_COLOR)
    if img is None:
        print("❌ Failed to load", input_path)
        sys.exit(1)

    result = equirectangular_to_rectilinear(img, fov, yaw, pitch, out_w, out_h)
    result = sharpen_image(result)

    save_image(output_path, result)

    if piece_widths:
        crop_pieces(result, output_path, piece_widths)