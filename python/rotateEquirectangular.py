import sys
import os
from PIL import Image
import numpy as np


def recenter_equirectangular(original_image_path: str, degree: float, output_image_path: str) -> None:
    """
    Re-center a 360 equirectangular image by rotating horizontally (yaw) a given degree.

    Args:
        original_image_path: Path to input JPG image.
        degree: Rotation degree in range [0, 360). Positive values rotate view to the right.
        output_image_path: Path to output JPG image.
    """
    degree = degree % 360.0

    with Image.open(original_image_path) as im:
        im.load()
        # RGB end-to-end avoids BGR↔RGB mismatch from OpenCV; JPEG is saved as YCbCr from RGB.
        base = im.convert("RGB")
        arr = np.asarray(base)
        height, width = arr.shape[:2]
        if width <= 0 or height <= 0:
            raise ValueError("Invalid image dimensions.")
        shift_pixels = int(round((degree / 360.0) * width))
        shifted = np.roll(arr, shift_pixels, axis=1)
        out = Image.fromarray(shifted, "RGB")

        out_dir = os.path.dirname(output_image_path)
        if out_dir and not os.path.exists(out_dir):
            os.makedirs(out_dir, exist_ok=True)

        save_kw = {
            "format": "JPEG",
            "quality": 100,
            "subsampling": 0,  # 4:4:4 — minimal chroma loss vs default 4:2:0
            "optimize": False,
        }
        dpi = im.info.get("dpi")
        if dpi and isinstance(dpi, tuple) and len(dpi) == 2:
            save_kw["dpi"] = dpi
        icc = im.info.get("icc_profile")
        if icc:
            save_kw["icc_profile"] = icc
        raw_exif = im.info.get("exif")
        if raw_exif:
            save_kw["exif"] = raw_exif

        out.save(output_image_path, **save_kw)


def main(argv):
    """
    CLI usage:
        python rotateEquirectangular.py <originalImage> <degree> <outputImage>

    - originalImage: path to input JPG
    - degree: float value in degrees (0–360); positive = rotate view to the right
    - outputImage: path to output JPG
    """
    if len(argv) != 4:
        print(
            "Usage: python rotateEquirectangular.py <originalImage> <degree> <outputImage>",
            file=sys.stderr,
        )
        sys.exit(1)

    original_image = argv[1]
    try:
        degree = float(argv[2])
    except ValueError:
        print("Error: degree must be a number (e.g., 45 or -90).", file=sys.stderr)
        sys.exit(1)

    output_image = argv[3]

    try:
        recenter_equirectangular(original_image, degree, output_image)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main(sys.argv)
