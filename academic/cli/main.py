import typer
from dotenv import load_dotenv

load_dotenv()

app = typer.Typer(name="academic", help="Academic CLI - UFG", add_completion=False)


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

    from academic.service import AcademicService

    service = AcademicService(cookies=cookies)

    typer.echo("Buscando dados no SIGAA...")
    try:
        data = service.update()
    except RuntimeError as e:
        typer.echo(str(e), err=True)
        raise typer.Exit(1)

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
