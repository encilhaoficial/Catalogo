from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


LARGURA = 800
ALTURA = 1000
TAMANHO_ALVO = 70 * 1024
QUALIDADE_MINIMA = 45
FORMATOS_ORIGINAIS = {".jpg", ".jpeg", ".png"}


def converter(origem: Path, destino: Path) -> int:
    with Image.open(origem) as arquivo:
        foto = ImageOps.exif_transpose(arquivo).convert("RGBA")
        foto.thumbnail((LARGURA, ALTURA), Image.Resampling.LANCZOS)

        quadro = Image.new("RGBA", (LARGURA, ALTURA), (0, 0, 0, 0))
        quadro.alpha_composite(
            foto,
            ((LARGURA - foto.width) // 2, (ALTURA - foto.height) // 2),
        )

    qualidade = 75
    while True:
        quadro.save(destino, "WEBP", quality=qualidade, method=6)
        tamanho = destino.stat().st_size
        if tamanho <= TAMANHO_ALVO or qualidade <= QUALIDADE_MINIMA:
            return tamanho
        qualidade -= 5


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Gera versões WebP 4:5 para as fotos do catálogo."
    )
    parser.add_argument(
        "--pasta",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "fotos",
        help="Pasta com fotos PNG/JPG (padrão: fotos/ do catálogo).",
    )
    args = parser.parse_args()
    pasta = args.pasta.resolve()

    if not pasta.is_dir():
        parser.error(f"A pasta não existe: {pasta}")

    convertidas = 0
    atualizadas = 0
    for origem in sorted(pasta.iterdir()):
        if origem.suffix.lower() not in FORMATOS_ORIGINAIS:
            continue

        destino = origem.with_suffix(".webp")
        if destino.exists() and destino.stat().st_mtime_ns >= origem.stat().st_mtime_ns:
            atualizadas += 1
            continue

        tamanho = converter(origem, destino)
        print(f"{origem.name} -> {destino.name} ({tamanho // 1024} KB)")
        convertidas += 1

    print(f"Convertidas: {convertidas}; já atualizadas: {atualizadas}.")


if __name__ == "__main__":
    main()
