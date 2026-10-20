# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make dev          # electron-vite dev (hot-reload for renderer; restarts main on change)
make build        # electron-vite build
make dist         # electron-builder → AppImage/deb/rpm/pacman in dist/
make clear        # delete all local data in ~/.local/share/sigaa-desktop/

# DB schema changes
npx drizzle-kit generate   # generate migration from schema change
npx drizzle-kit migrate    # apply migrations locally (dev only)
```

## Dev environment

Uses [Nix](https://nixos.org/) with flakes + [direnv](https://direnv.net/):

```bash
nix develop       # Node 22 + Electron with ELECTRON_OVERRIDE_DIST_PATH and LD_LIBRARY_PATH set
```

The `.envrc` activates it automatically via direnv.

## Architecture

The app follows a **microkernel** pattern: a `Kernel` core manages workspaces and data, and connectors (plugins) plug into it to provide auth and data fetching.

### Main process (`src/main/`)

**Entry** (`index.ts`): instantiates `Kernel`, calls `loadPlugins(kernel)` to register built-in connectors, calls `kernel.wireIpcHandlers()`, then opens the `BrowserWindow`.

**Kernel** (`kernel/Kernel.ts`): implements `KernelAPI`. Exposes three sub-APIs to connectors:
- `kernel.electron` — creates `BrowserWindow` instances and calls `shell.openExternal`
- `kernel.workspace` — CRUD for workspaces and their plugins (delegates to `model/workspaces.ts`)
- `kernel.data` — inserts/queries normalized `materia` and `atividade` rows (delegates to `model/materia.ts`)

Also wires all IPC handlers (`kernel:*` and `data:*` channels).

**Connector interface** (`kernel/types.ts`): a connector must implement `ConnectorDefinition`:
- `auth.login(kernel)` → opens auth UI (e.g. a `BrowserWindow`), returns a `WorkspacePlugin` with credentials
- `auth.refresh(wsId, plugin, kernel)` → fetches fresh data using stored credentials; falls back to re-login on expiry
- `materias` / `atividades` providers for data fetching

**Plugin loader** (`kernel/PluginLoader.ts`): hardcodes the list of built-in `ConnectorPlugin`s (currently only `sigaa-ufg`; classroom and turing are commented out stubs).

### Plugins (`src/plugins/`)

**sigaa-ufg** (`plugins/sigaa-ufg/`): the only active connector. Auth opens a `BrowserWindow` pointed at the SIGAA login page, waits for navigation to the portal, then extracts session cookies. The `scraper.ts` module spawns `sigaa-scraper discente`, passes cookies via stdin, and returns parsed JSON (profile + turmas + atividades). The plugin normalizes the data and stores it via `kernel.data`.

### Data persistence

- **`~/.local/share/sigaa-desktop/workspaces.json`** — workspace list with embedded plugin records (including stored credentials). Managed by `model/workspaces.ts`.
- **`~/.local/share/sigaa-desktop/{wsId}.sqlite`** — per-workspace SQLite with `materia` and `atividade` tables. Managed by Drizzle ORM (`db/schema.ts`, `db/index.ts`). Migrations in `db/migrations/` run on `initDb()` and are bundled under `resources/migrations/` in the AppImage.
- **Migration shim** (`model/workspaces.ts:migrateToWorkspaces`): on first run, converts the legacy `accounts.json` (and its per-account SQLite files) into the new workspace format.

### Preload (`src/preload/index.ts`)

Exposes `window.api` via `contextBridge`. The full type signature is in `src/renderer/src/types/api.d.ts`. IPC channels:
- `kernel:getWorkspaces / createWorkspace / openWorkspace / closeWorkspace / removeWorkspace`
- `kernel:getConnectors / getPlugins / addPlugin / removePlugin / togglePlugin / refreshAll / refreshPlugin`
- `data:getMateriasPorSemestre / getAtividadesPorMateria`

### Renderer (`src/renderer/src/`)

Vue 3 app with no router. `App.vue` drives a state machine:

```
loading → create-workspace | select-workspace → dashboard
```

On mount it calls `getWorkspaces()`; auto-opens if only one workspace exists. The dashboard and sidebar are re-mounted via a `dashboardKey` counter when data is refreshed.

UI uses Tailwind CSS v4 (via `@tailwindcss/vite`), `reka-ui` for primitives, and `lucide-vue-next` for icons.
