.PHONY: fetch academic tests front back

fetch:
	@test -n "$(URL)" || (echo "Uso: make fetch URL=https://exemplo.com [COOKIES='nome=valor; nome2=valor2']" && exit 1)
	.venv/bin/python scripts/fetch_html.py "$(URL)" $(if $(COOKIES),--cookies "$(COOKIES)",)

academic:
	.venv/bin/python -m academic.cli $(ARGS)

tests:
	.venv/bin/pytest tests/ -v

back:
	-fuser -k 8765/tcp 2>/dev/null
	.venv/bin/python server.py

front:
	cd tauri-app && npx tauri dev
