import cv2
import numpy as np
import os
from datetime import datetime

# --- Configuration ---
NODE_NAME = "node1"
LEVEL = "level_3"
FACE_DIR = os.path.join(os.getcwd(), 'output', NODE_NAME, LEVEL)
OUTPUT_WIDTH = 8192
OUTPUT_HEIGHT = OUTPUT_WIDTH // 2

def merge_to_360():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    print(f"Starting merge for {NODE_NAME} (NumPy Indexing Mode)...")

    # 1. Load the 6 faces
    face_names = ['front', 'right', 'back', 'left', 'up', 'down']
    faces = {}
    for name in face_names:
        img_path = os.path.join(FACE_DIR, f"{name}.jpg")
        if not os.path.exists(img_path):
            print(f"Error: Missing {img_path}")
            return
        faces[name] = cv2.imread(img_path)

    # 2. Setup the output coordinate grid (Full size is fine for NumPy)
    grid_x, grid_y = np.meshgrid(
        np.linspace(0, 1, OUTPUT_WIDTH), 
        np.linspace(0, 1, OUTPUT_HEIGHT)
    )

    theta = grid_x * 2 * np.pi - np.pi
    phi = grid_y * np.pi - np.pi / 2

    dx = np.cos(phi) * np.sin(theta)
    dy = np.sin(phi)
    dz = np.cos(phi) * np.cos(theta)

    max_axis = np.maximum(np.maximum(np.abs(dx), np.abs(dy)), np.abs(dz))
    xx, yy, zz = dx / max_axis, dy / max_axis, dz / max_axis

    panorama = np.zeros((OUTPUT_HEIGHT, OUTPUT_WIDTH, 3), dtype=np.uint8)

    # 3. Face Mapping Config
    face_map_configs = [
        ('right',  (xx == 1),  lambda: (-zz, -yy)),
        ('left',   (xx == -1), lambda: (zz, -yy)),
        ('up',     (yy == 1),  lambda: (xx, zz)),
        ('down',   (yy == -1), lambda: (xx, -zz)),
        ('front',  (zz == 1),  lambda: (xx, -yy)),
        ('back',   (zz == -1), lambda: (-xx, -yy))
    ]

    for name, mask, get_uv in face_map_configs:
        if not np.any(mask):
            continue
            
        face_img = faces[name]
        h, w = face_img.shape[:2]
        
        u, v = get_uv()
        u_seg = u[mask]
        v_seg = v[mask]

        # Convert [-1, 1] to pixel indices [0, w-1]
        # We use clip to ensure we don't go out of bounds
        ix = ((u_seg + 1) / 2 * (w - 1)).astype(np.int32)
        iy = ((v_seg + 1) / 2 * (h - 1)).astype(np.int32)
        
        ix = np.clip(ix, 0, w - 1)
        iy = np.clip(iy, 0, h - 1)

        # Fancy Indexing: Map face pixels to panorama mask
        panorama[mask] = face_img[iy, ix]

    # 4. Save
    file_name = f"pano_{NODE_NAME}_{timestamp}.jpg"
    output_path = os.path.join(FACE_DIR, file_name)
    cv2.imwrite(output_path, panorama, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    print(f"✅ Success! 360 Panorama saved: {file_name}")

if __name__ == "__main__":
    merge_to_360()