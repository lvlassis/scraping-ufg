# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make dev          # electron-vite dev (hot-reload for renderer; restarts main on change)
make build        # electron-vite build
make dist         # electron-builder → AppImage in dist/
make clear        # delete all local data in ~/.local/share/sigaa-desktop/

# DB schema changes
npx drizzle-kit generate   # generate migration from schema change
npx drizzle-kit migrate    # apply migrations locally (dev only)
```

## Build & packaging

```bash
make dist         # electron-builder → AppImage in dist/
```

## Dev environment

Uses [Nix](https://nixos.org/) with flakes + [direnv](https://direnv.net/). A single dev shell is defined:

```bash
nix develop       # Node 22 + Electron with ELECTRON_OVERRIDE_DIST_PATH and LD_LIBRARY_PATH set
```

The `.envrc` at the repo root activates it automatically via direnv.

## Architecture

**Main process** (`src/main/index.ts`):
- Opens a `BrowserWindow` with `partition: 'sigaa-login'` for the SIGAA login flow, waits for navigation to `/portais/discente/discente.jsf`, then extracts cookies via `session.cookies.get()`
- On login, pipes cookies to `sigaa-scraper discente` via stdin (`src/main/scraper.ts`) and persists the result
- Handles all IPC channels: `auth:*` and `materia:*`

**Scraper** (`src/main/scraper.ts`): spawns `sigaa-scraper discente`, writes cookies to stdin, returns parsed JSON.

**Preload** (`src/preload/index.ts`): exposes `window.api` to the renderer via `contextBridge`.

**Renderer** (`src/renderer/src/`): Vue 3, no router. `App.vue` manages a state machine: `loading → login | select-account → dashboard`. All backend calls go through `window.api`.

**Data persistence**:
- Per-account SQLite at `~/.local/share/sigaa-desktop/{matricula}.sqlite` — managed by Drizzle ORM (`src/main/db/`)
- Account list at `~/.local/share/sigaa-desktop/accounts.json` — plain JSON read/written by `src/main/model/accounts.ts`
- Migrations in `src/main/db/migrations/` are run on `initDb()` and bundled into the AppImage under `resources/migrations/`
