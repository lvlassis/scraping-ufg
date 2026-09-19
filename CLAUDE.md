# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Modules

The repo has two independent modules:

- **`sigaa-api/`** — FastAPI server that wraps the [`sigaa-scraper`](https://github.com/lvlassis/sigaa-scraper) library (Python, manages its own `.venv` via `uv`)
- **`desktop-app/`** — Electron + Vue 3 app that embeds the API binary (TypeScript/Node)

## Commands

### sigaa-api

```bash
cd sigaa-api
make dev          # uv run uvicorn sigaa_api.main:app --reload --host 127.0.0.1 --port 8765

# Fetch a page and save its HTML for selector development (uses urllib, not the scraper)
uv run python scripts/fetch_html.py <URL> [--cookies '_ufg_br_sess=...; JSESSIONID=...']
```

### desktop-app

```bash
cd desktop-app
make dev          # electron-vite dev (hot-reload for renderer; restarts main on change)
make build        # electron-vite build
make dist         # electron-builder → AppImage in dist/
make clear        # delete all local data in ~/.local/share/sigaa-desktop/

# DB schema changes
npx drizzle-kit generate   # generate migration from schema change
npx drizzle-kit migrate    # apply migrations locally (dev only)
```

### Build & packaging

The electron-builder config (`desktop-app/package.json` `build` key) expects the compiled API binary at `../sigaa-api-bin/sigaa-api`. Build it first:

```bash
nix build .#sigaa-api        # output at ./result/bin/sigaa-api
cp result/bin/sigaa-api sigaa-api-bin/sigaa-api
cd desktop-app && make dist
```

## Dev environment

Uses [Nix](https://nixos.org/) with flakes + [direnv](https://direnv.net/). The repo defines two dev shells:

- `nix develop .#sigaa-api` — Python 3.12 + uv (activated automatically via `sigaa-api/.envrc`)
- `nix develop .#desktop-app` — Node 22 + Electron with the correct `ELECTRON_OVERRIDE_DIST_PATH` and `LD_LIBRARY_PATH` set

Enter the right shell before working in each module.

## Architecture

### sigaa-api

A thin FastAPI wrapper with two endpoints:

- `GET /health` — liveness check
- `POST /update?cookies=<raw-cookie-string>` — calls `SigaaScraper(cookies).get_discente()` from the external `sigaa-scraper` library and returns `{ matricula, nome, materias[] }`

Errors: `401` on `SessionExpiredError`, `502` on `UnexpectedPageError`. All scraping logic lives in `sigaa-scraper`; this repo does not contain spider code.

### desktop-app

**Main process** (`src/main/index.ts`):
- In packaged mode, spawns `sigaa-api` binary from `process.resourcesPath`
- In dev mode, assumes `sigaa-api` is already running on port 8765
- Opens a `BrowserWindow` with `partition: 'sigaa-login'` for the SIGAA login flow, waits for navigation to `/portais/discente/discente.jsf`, then extracts cookies via `session.cookies.get()`
- Handles all IPC channels: `auth:*` and `materia:*`

**Preload** (`src/preload/index.ts`): exposes `window.api` to the renderer via `contextBridge`.

**Renderer** (`src/renderer/src/`): Vue 3, no router. `App.vue` manages a state machine: `loading → login | select-account → dashboard`. All backend calls go through `window.api`.

**Data persistence**:
- Per-account SQLite at `~/.local/share/sigaa-desktop/{matricula}.sqlite` — managed by Drizzle ORM (`src/main/db/`)
- Account list at `~/.local/share/sigaa-desktop/accounts.json` — plain JSON read/written by `src/main/model/accounts.ts`
- Migrations in `src/main/db/migrations/` are run on `initDb()` and bundled into the AppImage under `resources/migrations/`
