.PHONY: fetch academic tests

fetch:
	@test -n "$(URL)" || (echo "Uso: make fetch URL=https://exemplo.com [COOKIES='nome=valor; nome2=valor2']" && exit 1)
	.venv/bin/python scripts/fetch_html.py "$(URL)" $(if $(COOKIES),--cookies "$(COOKIES)",)

academic:
	.venv/bin/python -m academic.cli $(ARGS)

tests:
	.venv/bin/pytest tests/ -v
