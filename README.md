# SIGAA UFG Desktop

Aplicativo desktop para o SIGAA UFG, construído com Tauri + Vue.js.

## Descrição

O projeto é composto por três módulos:

- `sigaa-api/` — API FastAPI que faz scraping do SIGAA UFG usando [`sigaa-scraper`](https://github.com/lvlassis/sigaa-scraper), expondo dados acadêmicos via HTTP
- `frontend/` — interface Vue.js (Vite) que consome a API
- `desktop-app/` — shell Tauri (Rust) que empacota o frontend e sobe a API como processo filho

A API recebe os cookies de sessão do SIGAA via query parameter e retorna os dados do discente em JSON.

## Build

Requer [Nix](https://nixos.org/) com flakes habilitado.

```bash
# Compilar a API
nix build .#sigaa-api

# Executar o binário gerado
./result/bin/sigaa-api
```

## Desenvolvimento

Requer [Nix](https://nixos.org/) com flakes e [direnv](https://direnv.net/).

O ambiente entra automaticamente ao acessar o diretório (via `.envrc`). Na primeira vez, autorize com:

```bash
direnv allow
```

Isso cria o `.venv` com `uv sync` e o ativa automaticamente em toda sessão posterior.

### API

```bash
make dev
```

Configurar os cookies de sessão no `.env` (ver `.env.example`):

```
SIGAA_COOKIES=_ufg_br_sess=...; JSESSIONID=...
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # Vite na porta 5173, com hot reload
```

### Desktop

Em dois terminais separados:

```bash
# terminal 1 — frontend
cd frontend && npm run dev

# terminal 2 — app Tauri (abre a janela apontando para o Vite)
cd desktop-app && tauri dev
```

O Tauri também pode subir o Vite automaticamente via `beforeDevCommand` configurado em `tauri.conf.json`, bastando rodar apenas `tauri dev` no `desktop-app/`.
