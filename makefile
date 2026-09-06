.PHONY: fetch cli api desktop nix-desktop dev-api dev-desktop tests

PYTHON       = .venv/bin/python3.12
UVICORN      = .venv/bin/uvicorn
PYINSTALLER  = $(PYTHON) -m PyInstaller
TARGET_TRIPLE = $(shell rustc -vV 2>/dev/null | grep '^host:' | cut -d' ' -f2)

fetch:
	@test -n "$(URL)" || (echo "Uso: make fetch URL=https://exemplo.com [COOKIES='nome=valor; nome2=valor2']" && exit 1)
	$(PYTHON) scripts/fetch_html.py "$(URL)" $(if $(COOKIES),--cookies "$(COOKIES)",)

cli:
	mkdir -p build
	$(PYINSTALLER) --onefile --name sigaa --distpath build --workpath build/.work \
		--paths sigaa-cli --paths sigaa-scraper \
		sigaa-cli/sigaa_cli/__main__.py

api:
	mkdir -p build
	$(PYINSTALLER) --onefile --name sigaa-api --distpath build --workpath build/.work \
		--paths sigaa-api \
		sigaa-api/server.py

# Build completo via PyInstaller + npx tauri (dentro do FHS env do Nix)
desktop: api
	mkdir -p desktop-app/src-tauri/binaries
	cp build/sigaa-api "desktop-app/src-tauri/binaries/sigaa-api-$(TARGET_TRIPLE)"
	cd desktop-app && nix run ..#desktop-build

# Build Nix nativo: usa crane para compilar o Rust e wraps Python no store
# Resultado em ./result/bin/{academic,sigaa-api-<triple>}
nix-desktop:
	nix build .#desktop

dev-api:
	-fuser -k 8765/tcp 2>/dev/null
	PYTHONPATH=sigaa-api $(UVICORN) sigaa_api.main:app \
		--host 127.0.0.1 --port 8765 --reload

dev-desktop:
	cd desktop-app && npx tauri dev

tests:
	$(PYTHON) -m pytest sigaa-scraper/tests/ -v
