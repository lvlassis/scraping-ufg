.PHONY: fetch cli api desktop nix-desktop dev-api dev-desktop tests

PYTHON       = .venv/bin/python3.12
UVICORN      = .venv/bin/uvicorn

fetch:
	@test -n "$(URL)" || (echo "Uso: make fetch URL=https://exemplo.com [COOKIES='nome=valor; nome2=valor2']" && exit 1)
	$(PYTHON) scripts/fetch_html.py "$(URL)" $(if $(COOKIES),--cookies "$(COOKIES)",)

nix-api:
	nix build .#sigaa-api

dev-desktop:
	cd desktop-app && npx tauri dev

tests:
	$(PYTHON) -m pytest sigaa-scraper/tests/ -v
