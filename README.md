# SIGAA UFG API

API de web scraping para o SIGAA UFG, expondo dados acadêmicos via HTTP.

## Descrição

O projeto é composto por uma API FastAPI (`sigaa-api/`) que faz scraping do SIGAA UFG usando a biblioteca [`sigaa-scraper`](https://github.com/lvlassis/sigaa-scraper), e um aplicativo desktop (`desktop-app/`) construído com Tauri que consome essa API.

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

### Desktop

```bash
make dev-desktop
```
