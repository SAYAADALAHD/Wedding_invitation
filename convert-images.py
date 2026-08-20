from PIL import Image
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox

SUPPORTED_FORMATS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".tif",
    ".tiff",
    ".gif"
}

WEBP_QUALITY = 85


def convert_to_webp(input_folder):
    input_folder = Path(input_folder)

    # Folder hasil
    output_folder = input_folder / "webp"

    converted = 0
    failed = 0

    for file in input_folder.rglob("*"):

        # Lewati folder dan file yang bukan gambar
        if not file.is_file():
            continue

        if file.suffix.lower() not in SUPPORTED_FORMATS:
            continue

        # Jangan proses ulang folder webp
        if output_folder in file.parents:
            continue

        try:
            # Pertahankan struktur folder
            relative_path = file.relative_to(input_folder)

            output_file = (
                output_folder
                / relative_path.with_suffix(".webp")
            )

            output_file.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            with Image.open(file) as image:

                # Pertahankan transparansi PNG
                if image.mode in ("RGBA", "LA", "P"):
                    image = image.convert("RGBA")
                else:
                    image = image.convert("RGB")

                image.save(
                    output_file,
                    "WEBP",
                    quality=WEBP_QUALITY,
                    method=6
                )

            converted += 1

            print(f"[OK] {file.name} → {output_file}")

        except Exception as error:

            failed += 1

            print(f"[GAGAL] {file.name}")
            print(error)

    return converted, failed


def choose_folder():

    root = tk.Tk()
    root.withdraw()

    input_folder = filedialog.askdirectory(
        title="Pilih Folder Gambar"
    )

    if not input_folder:
        return

    converted, failed = convert_to_webp(
        input_folder
    )

    messagebox.showinfo(
        "Konversi Selesai",
        f"Berhasil : {converted} gambar\n"
        f"Gagal    : {failed} gambar\n\n"
        f"Hasil disimpan di:\n"
        f"{input_folder}\\webp"
    )


if __name__ == "__main__":
    choose_folder()