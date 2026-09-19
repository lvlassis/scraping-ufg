# SIGAA UFG Desktop

Aplicativo desktop para o SIGAA UFG, construído com Electron + Vue 3.

## Estrutura

- `sigaa-api/` — servidor FastAPI que expõe os dados do SIGAA via HTTP, usando a biblioteca [`sigaa-scraper`](https://github.com/lvlassis/sigaa-scraper)
- `desktop-app/` — app Electron + Vue 3 que embute o binário da API e gerencia autenticação, conta e dados locais

## Build

Requer [Nix](https://nixos.org/) com flakes habilitado.

```bash
# 1. Compilar a API
nix build .#sigaa-api
cp result/bin/sigaa-api sigaa-api-bin/sigaa-api

# 2. Gerar o AppImage
cd desktop-app && npm run dist
```

O electron-builder empacota o binário da API junto com o app (configurado em `package.json` em `build.extraResources`).

## Desenvolvimento

Requer [Nix](https://nixos.org/) com flakes e [direnv](https://direnv.net/). O projeto define dois dev shells separados.

### API

```bash
cd sigaa-api
direnv allow   # primeira vez — ativa o shell Nix e cria o .venv via uv
make dev       # uvicorn na porta 8765 com hot-reload
```

### Desktop

Entre no shell Nix do desktop (configura `ELECTRON_OVERRIDE_DIST_PATH` e `LD_LIBRARY_PATH`):

```bash
nix develop .#desktop-app
cd desktop-app
npm install    # primeira vez
make dev       # electron-vite dev
```

> Em modo de desenvolvimento o app assume que a API já está rodando em `http://127.0.0.1:8765`. O binário só é iniciado automaticamente no app empacotado.
