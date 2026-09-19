#!/usr/bin/env python3
"""Faz o fetch de uma URL e salva o HTML formatado em html_samples/."""
import argparse
import sys
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

from lxml import etree  # type: ignore[import-untyped]

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


def derive_filename(url: str) -> str:
    parsed = urlparse(url)
    segments = [s for s in parsed.path.split("/") if s]
    base = segments[-1] if segments else parsed.netloc.split(".")[0]
    return base.replace(".", "_") + ".html"


def main() -> None:
    parser = argparse.ArgumentParser(description="Faz fetch de uma URL e salva o HTML.")
    parser.add_argument("url", help="URL a ser requisitada")
    parser.add_argument("--cookies", default="", help='Cookies no formato "nome=valor; nome2=valor2"')
    parser.add_argument("--output-dir", default="html_samples", help="Diretório de saída")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / derive_filename(args.url)

    req = urllib.request.Request(args.url)
    req.add_header("User-Agent", USER_AGENT)
    if args.cookies:
        req.add_header("Cookie", args.cookies)

    try:
        with urllib.request.urlopen(req) as response:
            html_bytes = response.read()
    except urllib.error.HTTPError as e:
        print(f"Erro HTTP {e.code}: {e.reason}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"Erro de conexão: {e.reason}", file=sys.stderr)
        sys.exit(1)

    tree = etree.fromstring(html_bytes, parser=etree.HTMLParser())
    pretty = etree.tostring(tree, pretty_print=True, encoding="unicode", method="html")
    output_file.write_text(pretty, encoding="utf-8")
    print(f"HTML salvo em: {output_file}")


if __name__ == "__main__":
    main()
