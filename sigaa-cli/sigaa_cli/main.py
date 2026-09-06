import typer
from dotenv import load_dotenv

from sigaa_scraper import SigaaScraper, SessionExpiredError, UnexpectedPageError

load_dotenv()

app = typer.Typer(name="sigaa_scraper", help="Academic CLI - UFG", add_completion=False)


@app.command()
def update(
    cookies: str = typer.Option(None, envvar="SIGAA_COOKIES", help="Cookie header raw do SIGAA"),
) -> None:
    """Faz scraping do SIGAA e salva os dados localmente."""
    if not cookies:
        typer.echo(
            "Erro: cookies não fornecidos. Use --cookies ou defina SIGAA_COOKIES no .env.", err=True
        )
        raise typer.Exit(1)

    from sigaa_cli.db import init_db, save_snapshot

    typer.echo("Buscando dados no SIGAA...")
    try:
        data = SigaaScraper(cookies).get_discente()
    except SessionExpiredError:
        typer.echo("Erro: sessão expirada. Atualize os cookies.", err=True)
        raise typer.Exit(1)
    except UnexpectedPageError as e:
        typer.echo(str(e), err=True)
        raise typer.Exit(1)

    init_db()
    save_snapshot(data)

    typer.echo(f"\n{data['nome']}  ({data['matricula']})")
    typer.echo(f"Curso : {data['curso']}")
    typer.echo(f"MGE   : {data['mge']}   TI: {data['ti']}%   TA: {data['ta']}%")

    materias = data.get("materias", [])
    typer.echo(f"\nMatérias ({len(materias)}):")
    for m in materias:
        typer.echo(f"  • {m['nome']}  {m.get('horario', '')}")

    atividades = data.get("atividades", [])
    typer.echo(f"\nAtividades ({len(atividades)}):")
    for a in atividades:
        due = a.get("due") or "sem prazo"
        typer.echo(f"  [{a['tipo']}] {a['nome']} — {a['materia']} — {due}")

    atualizacoes = data.get("atualizacoes_turma", [])
    typer.echo(f"\nAtualizações de turma ({len(atualizacoes)}):")
    for u in atualizacoes:
        typer.echo(f"  {u['materia']}: {u['descricao'][:80]}")

    typer.echo("\nDados salvos.")
