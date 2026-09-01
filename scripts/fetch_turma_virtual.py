#!/usr/bin/env python3
"""GET no portal discente → encontra o form da matéria → POST para abrir a Turma Virtual."""
import argparse
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from dotenv import load_dotenv
from lxml import etree  # type: ignore[import-untyped]

BASE_URL = "https://sigaa.sistemas.ufg.br"
PORTAL_URL = f"{BASE_URL}/sigaa/portais/discente/discente.jsf"
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


class _CookieRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Mantém o header Cookie ao seguir redirects."""
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        new_req = super().redirect_request(req, fp, code, msg, headers, newurl)
        if new_req and req.has_header("Cookie"):
            new_req.add_unredirected_header("Cookie", req.get_header("Cookie"))
        return new_req


_opener = urllib.request.build_opener(_CookieRedirectHandler())


def _fetch(url: str, cookies: str, data: bytes | None = None, referer: str | None = None) -> bytes:
    req = urllib.request.Request(url, data=data)
    req.add_unredirected_header("User-Agent", USER_AGENT)
    req.add_unredirected_header("Cookie", cookies)
    if referer is not None:
        req.add_unredirected_header("Referer", referer)
    if data:
        req.add_unredirected_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with _opener.open(req) as resp:
            return resp.read()
    except urllib.error.HTTPError as e:
        print(f"Erro HTTP {e.code}: {e.reason}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"Erro de conexão: {e.reason}", file=sys.stderr)
        sys.exit(1)


def _find_form(tree, materia: str):
    query = materia.upper()
    for form in tree.xpath('//form[starts-with(@id, "form_acessarTurmaVirtual")]'):
        link = form.xpath('.//a[contains(@id, ":turmaVirtual")]')
        if link and query in "".join(link[0].itertext()).strip().upper():
            return form
    return None


def _build_post(form) -> bytes:
    form_id = form.get("id")
    id_turma = form.xpath('.//input[@name="idTurma"]/@value')[0]
    view_state = form.xpath('.//input[@name="javax.faces.ViewState"]/@value')[0]
    link_id = f"{form_id}:turmaVirtual"
    return urllib.parse.urlencode({
        form_id: form_id,
        "idTurma": id_turma,
        "javax.faces.ViewState": view_state,
        link_id: link_id,
    }).encode()


def _list_materias(tree) -> list[str]:
    nomes = []
    for form in tree.xpath('//form[starts-with(@id, "form_acessarTurmaVirtual")]'):
        link = form.xpath('.//a[contains(@id, ":turmaVirtual")]')
        if link:
            nomes.append("".join(link[0].itertext()).strip())
    return nomes


def main() -> None:
    parser = argparse.ArgumentParser(description="Abre a Turma Virtual de uma matéria no SIGAA.")
    parser.add_argument("materia", help="Nome (ou parte do nome) da matéria")
    parser.add_argument("--output", default="html_samples/turma_virtual.html")
    args = parser.parse_args()

    load_dotenv()
    cookies = os.getenv("SIGAA_COOKIES", "")
    if not cookies:
        print("Erro: SIGAA_COOKIES não definido no .env", file=sys.stderr)
        sys.exit(1)

    print("Buscando portal discente...", file=sys.stderr)
    portal_html = _fetch(PORTAL_URL, cookies)
    tree = etree.fromstring(portal_html, parser=etree.HTMLParser())

    form = _find_form(tree, args.materia)
    if form is None:
        print(f"Matéria '{args.materia}' não encontrada.", file=sys.stderr)
        materias = _list_materias(tree)
        if materias:
            print("Disponíveis:", file=sys.stderr)
            for nome in materias:
                print(f"  - {nome}", file=sys.stderr)
        sys.exit(1)

    print("Acessando turma virtual...", file=sys.stderr)
    turma_html = _fetch(PORTAL_URL, cookies, data=_build_post(form), referer=PORTAL_URL)

    tree2 = etree.fromstring(turma_html, parser=etree.HTMLParser())
    pretty = etree.tostring(tree2, pretty_print=True, encoding="unicode", method="html")
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(pretty, encoding="utf-8")
    print(f"HTML salvo em: {output}")


if __name__ == "__main__":
    main()
