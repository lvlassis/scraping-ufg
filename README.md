# SIGAA UFG Desktop

Aplicativo desktop para o SIGAA UFG, construído com Electron + Vue 3.

## Instalação

Baixe o instalador correspondente ao seu sistema na [página de releases](https://github.com/lvlassis/scraping-ufg/releases/latest).

### Ubuntu / Debian

```bash
sudo apt install ./sigaa-desktop_*_amd64.deb
```

### RHEL / Fedora

```bash
sudo dnf install ./sigaa-desktop-*.x86_64.rpm
```

### Arch Linux

```bash
sudo pacman -U sigaa-desktop-*.pacman
```

### NixOS

Adicione como input no seu `flake.nix`:

```nix
inputs.sigaa-desktop.url = "github:lvlassis/scraping-ufg";
```

E inclua no seu `home.packages` (home-manager) ou `environment.systemPackages`:

```nix
inputs.sigaa-desktop.packages.x86_64-linux.default
```

Ou instale diretamente no perfil:

```bash
nix profile install github:lvlassis/scraping-ufg
```

### Windows

Baixe o arquivo `Sigaa-Desktop-*-Setup.exe` e execute o instalador.

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
