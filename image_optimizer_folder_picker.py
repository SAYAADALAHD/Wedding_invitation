#!/usr/bin/env python3
"""
image_optimizer_reusable_v2.py
==============================

Versi perbaikan dari sistem reusable sebelumnya.

SISTEM TETAP:
- mode: max-only / band
- support JPG / JPEG / PNG / WEBP
- output ke folder baru
- jika dijalankan tanpa argumen, muncul pemilih folder
- struktur subfolder dipertahankan
- JPG/JPEG hanya menjadi WEBP jika memakai --convert-jpeg-to-webp
- tidak menimpa file asli

PERBAIKAN UTAMA:
- SEMUA gambar diproses.
- Tidak ada lagi SKIP / SMALL-KEEP yang hanya copy file.
- File kecil tetap dioptimasi/re-encode dengan kualitas tinggi.
- File besar diturunkan sampai <= max-kb.
- File yang sudah bagus tidak dipaksa membesar secara artifisial.
- Mode band tetap mencoba rentang min-kb sampai max-kb jika memungkinkan.

INSTALL:
    py -m pip install pillow

CONTOH:
    python image_optimizer_reusable_v2.py assets/images --mode max-only --max-kb 500

    python image_optimizer_reusable_v2.py assets/images --mode band \
        --min-kb 350 --max-kb 490 --target-kb 430

    python image_optimizer_reusable_v2.py assets/images --mode max-only \
        --max-kb 500 --convert-jpeg-to-webp
"""

from __future__ import annotations

import argparse
import io
import shutil
from pathlib import Path
from typing import Optional

from PIL import Image, ImageOps


SUPPORTED = {".jpg", ".jpeg", ".png", ".webp"}

MIN_QUALITY = 40
MAX_QUALITY = 100

DEFAULT_MAX_LONG_SIDE = 2400
DEFAULT_MIN_LONG_SIDE = 700

RESIZE_FACTOR = 0.90


# =========================================================
# UTILITIES
# =========================================================

def human_size(n: int) -> str:
    if n < 1024:
        return f"{n} B"
    if n < 1024 * 1024:
        return f"{n / 1024:.1f} KB"
    return f"{n / (1024 * 1024):.2f} MB"


def prepare_image(img: Image.Image, ext: str) -> Image.Image:
    img = ImageOps.exif_transpose(img)

    if ext in {".jpg", ".jpeg"}:
        if img.mode != "RGB":
            if "A" in img.getbands():
                background = Image.new("RGB", img.size, "white")
                background.paste(
                    img.convert("RGB"),
                    mask=img.getchannel("A"),
                )
                img = background
            else:
                img = img.convert("RGB")

    elif ext == ".webp":
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert(
                "RGBA" if "A" in img.getbands() else "RGB"
            )

    elif ext == ".png":
        if img.mode not in ("RGB", "RGBA", "L", "LA", "P"):
            img = img.convert(
                "RGBA" if "A" in img.getbands() else "RGB"
            )

    return img


def resize_to_long_side(
    img: Image.Image,
    long_side: int,
) -> Image.Image:
    width, height = img.size
    current_long = max(width, height)

    if current_long == long_side:
        return img.copy()

    scale = long_side / current_long

    return img.resize(
        (
            max(1, round(width * scale)),
            max(1, round(height * scale)),
        ),
        Image.Resampling.LANCZOS,
    )


def output_extension(
    source_ext: str,
    convert_jpeg_to_webp: bool,
) -> str:
    if convert_jpeg_to_webp and source_ext in {".jpg", ".jpeg"}:
        return ".webp"

    if source_ext == ".jpeg":
        return ".jpg"

    return source_ext


# =========================================================
# ENCODERS
# =========================================================

def encode_jpeg(
    img: Image.Image,
    quality: int,
) -> bytes:
    buffer = io.BytesIO()

    img.save(
        buffer,
        format="JPEG",
        quality=quality,
        optimize=True,
        progressive=True,
        subsampling="4:2:0",
    )

    return buffer.getvalue()


def encode_webp(
    img: Image.Image,
    quality: int,
) -> bytes:
    buffer = io.BytesIO()

    img.save(
        buffer,
        format="WEBP",
        quality=quality,
        method=6,
    )

    return buffer.getvalue()


def encode_png(
    img: Image.Image,
    colors: Optional[int] = None,
) -> bytes:
    buffer = io.BytesIO()
    output = img

    if colors is not None:
        if output.mode in ("RGBA", "LA"):
            output = output.convert("RGBA").quantize(
                colors=colors,
                method=Image.Quantize.FASTOCTREE,
                dither=Image.Dither.FLOYDSTEINBERG,
            )
        else:
            output = output.convert("RGB").quantize(
                colors=colors,
                method=Image.Quantize.MEDIANCUT,
                dither=Image.Dither.FLOYDSTEINBERG,
            )

    output.save(
        buffer,
        format="PNG",
        optimize=True,
        compress_level=9,
    )

    return buffer.getvalue()


def encode_lossy(
    img: Image.Image,
    ext: str,
    quality: int,
) -> bytes:
    if ext == ".webp":
        return encode_webp(img, quality)

    return encode_jpeg(img, quality)


# =========================================================
# LOSSY OPTIMIZATION
# =========================================================

def best_quality_under_limit(
    img: Image.Image,
    ext: str,
    max_bytes: int,
) -> tuple[Optional[bytes], Optional[int]]:
    """
    Cari quality tertinggi yang masih <= batas ukuran.
    """
    low = MIN_QUALITY
    high = MAX_QUALITY

    best_data: Optional[bytes] = None
    best_quality: Optional[int] = None

    while low <= high:
        quality = (low + high) // 2

        data = encode_lossy(
            img,
            ext,
            quality,
        )

        if len(data) <= max_bytes:
            best_data = data
            best_quality = quality
            low = quality + 1
        else:
            high = quality - 1

    return best_data, best_quality


def optimize_lossy(
    img: Image.Image,
    ext: str,
    mode: str,
    original_size: int,
    min_bytes: int,
    max_bytes: int,
    target_bytes: int,
    max_long_side: int,
    min_long_side: int,
    force_min: bool,
) -> tuple[bytes, Image.Image, int, str]:
    """
    Semua JPG/JPEG/WEBP akan di-encode ulang.

    max-only:
      - file kecil -> kualitas setinggi mungkin, tidak perlu dibesarkan
      - file besar -> ditekan <= max_bytes

    band:
      - mencoba min..max
      - jika file awal kecil dan force_min=False, fokus kualitas tinggi
        tanpa membesarkan file secara artifisial
    """

    original_long = max(img.size)
    start_long = min(
        original_long,
        max_long_side,
    )

    candidates = []

    current_long = start_long

    while current_long >= min_long_side:
        candidate_img = resize_to_long_side(
            img,
            current_long,
        )

        if mode == "max-only":
            size_limit = max_bytes

        elif original_size < min_bytes and not force_min:
            # Tetap proses file kecil, tetapi jangan memaksa membesarkan.
            size_limit = min(
                max_bytes,
                max(
                    original_size,
                    64 * 1024,
                ),
            )
        else:
            size_limit = max_bytes

        data, quality = best_quality_under_limit(
            candidate_img,
            ext,
            size_limit,
        )

        if data is not None and quality is not None:
            size = len(data)

            if mode == "band" and (
                original_size >= min_bytes or force_min
            ):
                in_band = min_bytes <= size <= max_bytes

                # Utamakan file yang masuk rentang,
                # kemudian yang paling dekat target.
                priority = (
                    0 if in_band else 1,
                    abs(size - target_bytes),
                    -quality,
                )
            else:
                # Untuk max-only / file kecil:
                # utamakan quality tinggi, lalu ukuran kecil.
                priority = (
                    0,
                    -quality,
                    size,
                )

            candidates.append(
                (
                    priority,
                    data,
                    candidate_img,
                    quality,
                )
            )

            # Jika file besar sudah aman dengan quality bagus,
            # tidak perlu resize lebih jauh.
            if (
                size <= max_bytes
                and quality >= 88
                and (
                    mode == "max-only"
                    or original_size < min_bytes
                    or min_bytes <= size <= max_bytes
                )
            ):
                break

        next_long = round(
            current_long * RESIZE_FACTOR
        )

        if next_long >= current_long:
            next_long = current_long - 1

        current_long = next_long

    if candidates:
        candidates.sort(
            key=lambda item: item[0]
        )

        _, data, final_img, quality = candidates[0]

        size = len(data)

        if mode == "band":
            if min_bytes <= size <= max_bytes:
                status = "in-range"
            elif size < min_bytes:
                status = "below-min"
            else:
                status = "above-max"
        else:
            status = (
                "under-max"
                if size <= max_bytes
                else "above-max"
            )

        return (
            data,
            final_img,
            quality,
            status,
        )

    # =====================================================
    # FALLBACK
    # =====================================================

    current = resize_to_long_side(
        img,
        min(
            original_long,
            max_long_side,
        ),
    )

    while True:
        data = encode_lossy(
            current,
            ext,
            MIN_QUALITY,
        )

        if len(data) <= max_bytes:
            return (
                data,
                current,
                MIN_QUALITY,
                "fallback-under-max",
            )

        current_long = max(current.size)

        if current_long <= min_long_side:
            return (
                data,
                current,
                MIN_QUALITY,
                "warning-above-max",
            )

        next_long = max(
            min_long_side,
            round(
                current_long
                * RESIZE_FACTOR
            ),
        )

        current = resize_to_long_side(
            current,
            next_long,
        )


# =========================================================
# PNG OPTIMIZATION
# =========================================================

def optimize_png(
    img: Image.Image,
    max_bytes: int,
    max_long_side: int,
    min_long_side: int,
) -> tuple[bytes, Image.Image, str]:
    """
    SEMUA PNG diproses.
    Coba lossless optimize lebih dulu.
    Jika masih > max, baru quantize dan resize.
    """

    current = resize_to_long_side(
        img,
        min(
            max(img.size),
            max_long_side,
        ),
    )

    # Selalu re-save PNG.
    data = encode_png(current)

    if len(data) <= max_bytes:
        return (
            data,
            current,
            "lossless-optimized",
        )

    palette_levels = [
        256,
        192,
        128,
        96,
        64,
        48,
        32,
    ]

    while True:
        for colors in palette_levels:
            data = encode_png(
                current,
                colors,
            )

            if len(data) <= max_bytes:
                return (
                    data,
                    current,
                    f"{colors} colors",
                )

        current_long = max(current.size)

        if current_long <= min_long_side:
            return (
                data,
                current,
                "warning-above-max",
            )

        next_long = max(
            min_long_side,
            round(
                current_long
                * RESIZE_FACTOR
            ),
        )

        current = resize_to_long_side(
            current,
            next_long,
        )


# =========================================================
# SINGLE FILE PROCESSING
# =========================================================

def process_one(
    src: Path,
    dst: Path,
    mode: str,
    min_bytes: int,
    max_bytes: int,
    target_bytes: int,
    force_min: bool,
    max_long_side: int,
    min_long_side: int,
    convert_jpeg_to_webp: bool,
):
    original_size = src.stat().st_size
    source_ext = src.suffix.lower()

    out_ext = output_extension(
        source_ext,
        convert_jpeg_to_webp,
    )

    with Image.open(src) as opened:
        img = prepare_image(
            opened.copy(),
            out_ext,
        )

    original_dimensions = img.size

    dst = dst.with_suffix(out_ext)
    dst.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    if out_ext == ".png":
        data, final_img, info = optimize_png(
            img=img,
            max_bytes=max_bytes,
            max_long_side=max_long_side,
            min_long_side=min_long_side,
        )

        quality_info = info

    else:
        data, final_img, quality, range_status = optimize_lossy(
            img=img,
            ext=out_ext,
            mode=mode,
            original_size=original_size,
            min_bytes=min_bytes,
            max_bytes=max_bytes,
            target_bytes=target_bytes,
            max_long_side=max_long_side,
            min_long_side=min_long_side,
            force_min=force_min,
        )

        quality_info = (
            f"q={quality}, "
            f"{range_status}"
        )

    dst.write_bytes(data)

    final_size = len(data)

    if final_size <= max_bytes:
        status = "OK"
    else:
        status = "WARN"

    return (
        dst,
        status,
        original_size,
        final_size,
        original_dimensions,
        final_img.size,
        quality_info,
    )


# =========================================================
# FOLDER PICKER
# =========================================================

def choose_input_folder() -> Path:
    """
    Tampilkan dialog Windows/macOS/Linux untuk memilih folder gambar.
    Dipakai otomatis jika script dijalankan tanpa argumen folder input.
    """
    try:
        import tkinter as tk
        from tkinter import filedialog
    except ImportError:
        raise SystemExit(
            "Tkinter tidak tersedia di instalasi Python ini.\n"
            "Jalankan script dengan folder lewat terminal atau instal Tkinter."
        )

    root = tk.Tk()
    root.withdraw()

    try:
        root.attributes("-topmost", True)
    except tk.TclError:
        pass

    folder = filedialog.askdirectory(
        parent=root,
        title="Pilih folder gambar yang ingin dikompres",
        mustexist=True,
    )

    root.destroy()

    if not folder:
        raise SystemExit("Pemilihan folder dibatalkan.")

    return Path(folder)


def show_finished_dialog(
    output_root: Path,
    processed_count: int,
) -> None:
    """
    Beri notifikasi selesai ketika script dijalankan melalui folder picker.
    """
    try:
        import tkinter as tk
        from tkinter import messagebox

        root = tk.Tk()
        root.withdraw()

        try:
            root.attributes("-topmost", True)
        except tk.TclError:
            pass

        messagebox.showinfo(
            "Kompresi selesai",
            (
                f"{processed_count} gambar selesai diproses.\n\n"
                f"Folder hasil:\n{output_root}"
            ),
            parent=root,
        )

        root.destroy()

    except Exception:
        # Dialog selesai hanya fitur tambahan.
        # Kegagalan dialog tidak boleh membuat proses utama gagal.
        pass


# =========================================================
# MAIN
# =========================================================

def main():
    parser = argparse.ArgumentParser(
        description=(
            "Reusable optimizer. "
            "Semua gambar selalu diproses."
        )
    )

    parser.add_argument(
        "input",
        type=Path,
        nargs="?",
        default=None,
        help=(
            "Folder input gambar. "
            "Jika tidak diisi, dialog pemilih folder akan muncul."
        ),
    )

    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help=(
            "Folder output. Jika tidak diisi, dibuat otomatis "
            "di samping folder input dengan nama <folder>_optimized."
        ),
    )

    parser.add_argument(
        "--mode",
        choices=[
            "max-only",
            "band",
        ],
        default="max-only",
        help=(
            "Tetap sama: "
            "max-only / band"
        ),
    )

    parser.add_argument(
        "--min-kb",
        type=int,
        default=350,
    )

    parser.add_argument(
        "--max-kb",
        type=int,
        default=500,
    )

    parser.add_argument(
        "--target-kb",
        type=int,
        default=430,
    )

    parser.add_argument(
        "--force-min",
        action="store_true",
        help=(
            "Pada mode band, coba "
            "mendorong file kecil "
            "ke rentang minimum."
        ),
    )

    parser.add_argument(
        "--convert-jpeg-to-webp",
        action="store_true",
        help=(
            "Opsional. Sistem lama tetap: "
            "JPG hanya jadi WEBP "
            "jika flag ini dipakai."
        ),
    )

    parser.add_argument(
        "--max-long-side",
        type=int,
        default=DEFAULT_MAX_LONG_SIDE,
    )

    parser.add_argument(
        "--min-long-side",
        type=int,
        default=DEFAULT_MIN_LONG_SIDE,
    )

    parser.add_argument(
        "--copy-non-images",
        action="store_true",
    )

    args = parser.parse_args()

    if (
        args.mode == "band"
        and not (
            0
            < args.min_kb
            < args.target_kb
            < args.max_kb
        )
    ):
        raise SystemExit(
            "Mode band harus memenuhi: "
            "min-kb < target-kb < max-kb"
        )

    # =====================================================
    # PILIH FOLDER INPUT
    # =====================================================

    used_folder_picker = args.input is None

    if used_folder_picker:
        input_root = choose_input_folder().resolve()
    else:
        input_root = args.input.resolve()

    # =====================================================
    # FOLDER OUTPUT
    # =====================================================
    #
    # Contoh:
    #   Input  : D:\Project\assets\images
    #   Output : D:\Project\assets\images_optimized
    #
    # Tetap tidak menimpa folder gambar asli.
    # =====================================================

    if args.output is not None:
        output_root = args.output.resolve()
    else:
        output_root = (
            input_root.parent
            / f"{input_root.name}_optimized"
        ).resolve()

    if not input_root.exists():
        raise SystemExit(
            f"Folder tidak ditemukan: "
            f"{input_root}"
        )

    min_bytes = args.min_kb * 1024
    max_bytes = args.max_kb * 1024
    target_bytes = args.target_kb * 1024

    all_files = [
        file
        for file in input_root.rglob("*")
        if file.is_file()
    ]

    image_files = [
        file
        for file in all_files
        if file.suffix.lower()
        in SUPPORTED
    ]

    non_image_files = [
        file
        for file in all_files
        if file.suffix.lower()
        not in SUPPORTED
    ]

    if not image_files:
        raise SystemExit(
            "Tidak ada JPG/JPEG/PNG/WEBP."
        )

    print("=" * 80)
    print("REUSABLE IMAGE OPTIMIZER V2")
    print("=" * 80)
    print(f"Input                : {input_root}")
    print(f"Output               : {output_root}")
    print(f"Mode                 : {args.mode}")
    print(f"Min KB               : {args.min_kb}")
    print(f"Max KB               : {args.max_kb}")
    print(f"Target KB            : {args.target_kb}")
    print(
        "Convert JPEG -> WEBP : "
        + (
            "YA"
            if args.convert_jpeg_to_webp
            else "TIDAK"
        )
    )
    print(
        f"Jumlah image         : "
        f"{len(image_files)}"
    )
    print("=" * 80)

    total_before = 0
    total_after = 0

    processed_count = 0
    under_max_count = 0
    in_range_count = 0
    warning_count = 0

    for src in image_files:
        relative = src.relative_to(
            input_root
        )

        dst = output_root / relative

        try:
            (
                final_path,
                status,
                before,
                after,
                old_dimensions,
                new_dimensions,
                info,
            ) = process_one(
                src=src,
                dst=dst,
                mode=args.mode,
                min_bytes=min_bytes,
                max_bytes=max_bytes,
                target_bytes=target_bytes,
                force_min=args.force_min,
                max_long_side=args.max_long_side,
                min_long_side=args.min_long_side,
                convert_jpeg_to_webp=(
                    args.convert_jpeg_to_webp
                ),
            )

            processed_count += 1
            total_before += before
            total_after += after

            if after <= max_bytes:
                under_max_count += 1

            if (
                min_bytes
                <= after
                <= max_bytes
            ):
                in_range_count += 1

            if status == "WARN":
                warning_count += 1

            output_relative = (
                final_path.relative_to(
                    output_root
                )
            )

            print(
                f"\n[{status}] {relative}"
            )

            print(
                f"    -> {output_relative}"
            )

            print(
                f"    {old_dimensions} "
                f"-> {new_dimensions}"
            )

            print(
                f"    {human_size(before)} "
                f"-> {human_size(after)} "
                f"| {info}"
            )

        except Exception as error:
            warning_count += 1

            print(
                f"\n[ERROR] "
                f"{relative}: {error}"
            )

    if args.copy_non_images:
        for src in non_image_files:
            relative = src.relative_to(
                input_root
            )

            dst = (
                output_root
                / relative
            )

            dst.parent.mkdir(
                parents=True,
                exist_ok=True,
            )

            shutil.copy2(
                src,
                dst,
            )

    saved = max(
        0,
        total_before - total_after,
    )

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    print(
        f"Diproses          : "
        f"{processed_count}/"
        f"{len(image_files)}"
    )

    print(
        f"Total sebelum     : "
        f"{human_size(total_before)}"
    )

    print(
        f"Total sesudah     : "
        f"{human_size(total_after)}"
    )

    print(
        f"Hemat             : "
        f"{human_size(saved)}"
    )

    if total_before:
        print(
            f"Pengurangan       : "
            f"{saved / total_before * 100:.1f}%"
        )

    print(
        f"<= {args.max_kb} KB        : "
        f"{under_max_count}/"
        f"{len(image_files)}"
    )

    if args.mode == "band":
        print(
            f"{args.min_kb}-"
            f"{args.max_kb} KB     : "
            f"{in_range_count}/"
            f"{len(image_files)}"
        )

    print(
        f"Warnings          : "
        f"{warning_count}"
    )

    print(
        f"Output            : "
        f"{output_root}"
    )

    print("=" * 80)

    # Jika dijalankan tanpa argumen dan memakai folder picker,
    # tampilkan notifikasi selesai agar nyaman saat script di-double-click.
    if used_folder_picker:
        show_finished_dialog(
            output_root=output_root,
            processed_count=processed_count,
        )


if __name__ == "__main__":
    main()
