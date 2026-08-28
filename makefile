dev:
	uvicorn app.main:app --reload

fetch:
	@test -n "$(URL)" || (echo "Uso: make fetch URL=https://exemplo.com [COOKIES='nome=valor; nome2=valor2']" && exit 1)
	.venv/bin/python scripts/fetch_html.py "$(URL)" $(if $(COOKIES),--cookies "$(COOKIES)",)

sigaa-me:
	.venv/bin/python scripts/fetch_html.py "https://sigaa.sistemas.ufg.br/sigaa/portais/discente/discente.jsf" --cookies # Inserir cookie

