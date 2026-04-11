#!/usr/bin/env python3
"""
Ghép 6 mặt cubemap (px, nx, py, ny, pz, nz) trong một thư mục thành một ảnh equirectangular 360°.

Logic chọn mặt / hướng UV khớp với cube2sphere.js (repo) để đồng bộ với pipeline JS.

Yêu cầu: 6 ảnh cùng kích thước. Mặc định output: width = w_face * 4, height = h_face * 2.
"""

from __future__ import annotations

import argparse
import os
import sys

import cv2
import numpy as np

FACE_ORDER = ("px", "nx", "py", "ny", "pz", "nz")
IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".bmp")


def find_face_path(folder: str, face: str) -> str:
    for ext in IMAGE_EXTS:
        p = os.path.join(folder, face + ext)
        if os.path.isfile(p):
            return p
    raise FileNotFoundError(
        f"Không tìm thấy {face}.* trong {folder} (thử: {', '.join(IMAGE_EXTS)})"
    )


def load_cube_faces(folder: str) -> dict[str, np.ndarray]:
    paths = {f: find_face_path(folder, f) for f in FACE_ORDER}
    imgs = {}
    for f, p in paths.items():
        img = cv2.imread(p, cv2.IMREAD_UNCHANGED)
        if img is None:
            raise RuntimeError(f"Không đọc được ảnh: {p}")
        imgs[f] = img
    return imgs


def assert_same_size(imgs: dict[str, np.ndarray]) -> tuple[int, int]:
    hs = {im.shape[0] for im in imgs.values()}
    ws = {im.shape[1] for im in imgs.values()}
    if len(hs) != 1 or len(ws) != 1:
        raise ValueError(
            "Cả 6 ảnh phải cùng kích thước. Hiện có: "
            + ", ".join(f"{k}={v.shape[1]}x{v.shape[0]}" for k, v in imgs.items())
        )
    h, w = next(iter(imgs.values())).shape[:2]
    return w, h


def equirect_uv_maps(out_w: int, out_h: int) -> tuple[np.ndarray, np.ndarray, dict[str, np.ndarray]]:
    """
    Trả về u, v trong [0,1] và mask cho từng mặt (logic giống cube2sphere.js).
    """
    oy, ox = np.mgrid[0:out_h, 0:out_w].astype(np.float64)
    lat = np.pi * ((out_h - 1 - oy) / out_h - 0.5)
    lon = 2 * np.pi * (1 - ox / out_w - 0.5)
    cos_lat = np.cos(lat)
    dx = cos_lat * np.sin(lon)
    dy = np.sin(lat)
    dz = cos_lat * np.cos(lon)

    abs_x = np.abs(dx)
    abs_y = np.abs(dy)
    abs_z = np.abs(dz)
    ma = np.maximum(np.maximum(abs_x, abs_y), abs_z)
    sx = dx / ma
    sy = dy / ma
    sz = dz / ma

    dom_x = (abs_x > abs_y) & (abs_x > abs_z)
    dom_y = (~dom_x) & (abs_y > abs_z)
    dom_z = ~dom_x & ~dom_y

    u = np.empty_like(dx)
    v = np.empty_like(dy)

    # px / nx: hoán đổi như JS (direction.x > 0 -> nx)
    m = dom_x & (dx <= 0)
    u[m] = (-sz[m] + 1.0) * 0.5
    v[m] = (-sy[m] + 1.0) * 0.5
    m = dom_x & (dx > 0)
    u[m] = (sz[m] + 1.0) * 0.5
    v[m] = (-sy[m] + 1.0) * 0.5

    m = dom_y & (dy > 0)
    u[m] = (-sx[m] + 1.0) * 0.5
    v[m] = (sz[m] + 1.0) * 0.5
    m = dom_y & (dy <= 0)
    u[m] = (-sx[m] + 1.0) * 0.5
    v[m] = (-sz[m] + 1.0) * 0.5

    m = dom_z & (dz > 0)
    u[m] = (-sx[m] + 1.0) * 0.5
    v[m] = (-sy[m] + 1.0) * 0.5
    m = dom_z & (dz <= 0)
    u[m] = (sx[m] + 1.0) * 0.5
    v[m] = (-sy[m] + 1.0) * 0.5

    np.clip(u, 0.0, 1.0, out=u)
    np.clip(v, 0.0, 1.0, out=v)

    masks = {
        "px": dom_x & (dx <= 0),
        "nx": dom_x & (dx > 0),
        "py": dom_y & (dy > 0),
        "ny": dom_y & (dy <= 0),
        "pz": dom_z & (dz > 0),
        "nz": dom_z & (dz <= 0),
    }
    return u.astype(np.float32), v.astype(np.float32), masks


def cubemap_to_equirect(
    imgs: dict[str, np.ndarray],
    out_w: int,
    out_h: int,
    interpolation: int = cv2.INTER_LANCZOS4,
) -> np.ndarray:
    fw, fh = imgs["px"].shape[1], imgs["px"].shape[0]
    u, v, masks = equirect_uv_maps(out_w, out_h)

    ch = imgs["px"].shape[2] if imgs["px"].ndim == 3 else 1
    if imgs["px"].ndim == 2:
        base = np.zeros((out_h, out_w), dtype=imgs["px"].dtype)
    else:
        base = np.zeros((out_h, out_w, ch), dtype=imgs["px"].dtype)

    for face in FACE_ORDER:
        mask = masks[face]
        if not np.any(mask):
            continue
        src = imgs[face]
        map_x = np.zeros((out_h, out_w), dtype=np.float32)
        map_y = np.zeros((out_h, out_w), dtype=np.float32)
        map_x[mask] = u[mask] * (fw - 1)
        map_y[mask] = v[mask] * (fh - 1)
        warped = cv2.remap(
            src,
            map_x,
            map_y,
            interpolation,
            borderMode=cv2.BORDER_REPLICATE,
        )
        base[mask] = warped[mask]

    return base


def save_image(path: str, img: np.ndarray) -> None:
    ext = os.path.splitext(path)[1].lower()
    if ext in (".jpg", ".jpeg"):
        cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, 100])
    elif ext == ".png":
        cv2.imwrite(path, img, [cv2.IMWRITE_PNG_COMPRESSION, 0])
    elif ext in (".tif", ".tiff"):
        cv2.imwrite(path, img, [cv2.IMWRITE_TIFF_COMPRESSION, 1])
    else:
        cv2.imwrite(path, img)
    print(f"Đã ghi: {path}")


def main() -> None:
    p = argparse.ArgumentParser(
        description="Cubemap 6 mặt (px,nx,py,ny,pz,nz) -> equirectangular 360°"
    )
    p.add_argument("input_dir", help="Thư mục chứa px.*, nx.*, ...")
    p.add_argument("output_path", help="File ảnh ra (vd: out.png)")
    p.add_argument(
        "--width",
        type=int,
        default=None,
        help="Chiều ngang output (mặc định: 4 × width một mặt)",
    )
    p.add_argument(
        "--height",
        type=int,
        default=None,
        help="Chiều dọc output (mặc định: 2 × height một mặt)",
    )
    p.add_argument(
        "--linear",
        action="store_true",
        help="Dùng nội suy bilinear (nhanh hơn; mặc định: LANCZOS4)",
    )
    args = p.parse_args()

    folder = os.path.abspath(args.input_dir)
    if not os.path.isdir(folder):
        print(f"Không phải thư mục: {folder}", file=sys.stderr)
        sys.exit(1)

    imgs = load_cube_faces(folder)
    fw, fh = assert_same_size(imgs)

    out_w = args.width if args.width is not None else fw * 4
    out_h = args.height if args.height is not None else fh * 2
    if out_w < 2 or out_h < 2:
        print("width/height phải >= 2", file=sys.stderr)
        sys.exit(1)

    interp = cv2.INTER_LINEAR if args.linear else cv2.INTER_LANCZOS4
    pano = cubemap_to_equirect(imgs, out_w, out_h, interpolation=interp)
    save_image(os.path.abspath(args.output_path), pano)


if __name__ == "__main__":
    main()
