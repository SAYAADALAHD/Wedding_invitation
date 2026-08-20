from fontTools.ttLib import TTFont
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox

SUPPORTED_FORMATS = {".ttf", ".otf"}


def convert_fonts(input_folder):
    input_folder = Path(input_folder)
    output_folder = input_folder / "woff2"

    converted = 0
    failed = 0

    for file in input_folder.rglob("*"):
        if not file.is_file():
            continue

        if file.suffix.lower() not in SUPPORTED_FORMATS:
            continue

        if output_folder in file.parents:
            continue

        try:
            output_file = (
                output_folder
                / file.relative_to(input_folder).with_suffix(".woff2")
            )

            output_file.parent.mkdir(parents=True, exist_ok=True)

            font = TTFont(file)
            font.flavor = "woff2"
            font.save(output_file)
            font.close()

            converted += 1
            print(f"[OK] {file.name} -> {output_file}")

        except Exception as error:
            failed += 1
            print(f"[GAGAL] {file.name}")
            print(f"       {error}")

    return converted, failed, output_folder


def choose_folder():
    root = tk.Tk()
    root.withdraw()

    input_folder = filedialog.askdirectory(
        title="Pilih folder yang berisi file font TTF/OTF"
    )

    root.destroy()

    if not input_folder:
        return

    converted, failed, output_folder = convert_fonts(input_folder)

    messagebox.showinfo(
        "Konversi Selesai",
        f"Berhasil : {converted} font\n"
        f"Gagal    : {failed} font\n\n"
        f"Hasil disimpan di:\n{output_folder}"
    )


if __name__ == "__main__":
    choose_folder()