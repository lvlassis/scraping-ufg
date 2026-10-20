import type { BrowserWindow } from 'electron'
import type { CommandDefinition, CommandInfo, StoredCommand } from './command'

export type { CommandDefinition, CommandInfo, StoredCommand }

// ── Credential ────────────────────────────────────────────────────────────────

export type ConnectorCredential = Record<string, string>

// ── Workspace ─────────────────────────────────────────────────────────────────

export interface Workspace {
  id: string
  name: string
  createdAt: string
}

// Plugin configured within a workspace (server-side, contains credential)
export interface WorkspacePlugin {
  connectorId: string
  enabled: boolean
  credential?: ConnectorCredential
  userId?: string
  displayName?: string
}

export interface WorkspaceShortcut {
  commandId: string
  accelerator: string
}

export type WorkspaceRecord = Workspace & { plugins: WorkspacePlugin[]; shortcuts?: WorkspaceShortcut[] }

// Plugin info sent to renderer (no credential)
export interface ConnectorStatus {
  connectorId: string
  connectorDisplayName: string
  userId?: string
  displayName?: string
  enabled: boolean
}

// ── Connector info (returned to renderer) ────────────────────────────────────

export interface ConnectorInfo {
  id: string
  displayName: string
  description?: string
  authMethod: 'browser-window' | 'oauth' | 'session'
}

// ── Normalized data shapes ────────────────────────────────────────────────────

export interface NormalizedMateria {
  id: string
  nome: string
  local: string
  horario: string
  semestre: string
}

export interface NormalizedAtividade {
  id: string
  tipo: string
  due: string | null
  nome: string
  materia_nome: string
  semestre: string
}

// ── Kernel API surface ────────────────────────────────────────────────────────

export interface ElectronBridge {
  createBrowserWindow(options: {
    partition?: string
    title?: string
    width?: number
    height?: number
  }): BrowserWindow
  openExternal(url: string): Promise<void>
}

export interface WorkspaceStore {
  getWorkspaces(): Workspace[]
  createWorkspace(name: string): Workspace
  removeWorkspace(id: string): void
  getPlugins(workspaceId: string): WorkspacePlugin[]
  upsertPlugin(workspaceId: string, plugin: WorkspacePlugin): void
  removePlugin(workspaceId: string, connectorId: string): void
  getPlugin(workspaceId: string, connectorId: string): WorkspacePlugin | undefined
}

export interface DataStore {
  insertMaterias(materias: NormalizedMateria[]): void
  insertAtividades(atividades: NormalizedAtividade[]): void
  getMateriasPorSemestre(semestre: string): NormalizedMateria[]
  getAtividadesPorMateria(materiaNome: string, semestre: string): NormalizedAtividade[]
  getSemestreAtual(): string
}

export interface IpcBus {
  handle<T>(channel: string, handler: (...args: unknown[]) => T | Promise<T>): void
}

export interface ShortcutsStore {
  getShortcuts(workspaceId: string): WorkspaceShortcut[]
  setShortcut(workspaceId: string, commandId: string, accelerator: string): void
  removeShortcut(workspaceId: string, commandId: string): void
}

export interface KernelAPI {
  registerConnector(definition: ConnectorDefinition): void
  registerCommand(definition: StoredCommand): void
  electron: ElectronBridge
  workspace: WorkspaceStore
  data: DataStore
  shortcuts: ShortcutsStore
  getIpcBus(connectorId: string): IpcBus
}

// ── Connector interfaces ──────────────────────────────────────────────────────

export interface ConnectorAuth {
  method: 'browser-window' | 'oauth' | 'session'
  login(kernel: KernelAPI, ...extra: unknown[]): Promise<WorkspacePlugin>
  refresh(workspaceId: string, plugin: WorkspacePlugin, kernel: KernelAPI): Promise<void>
}

export interface MateriasProvider {
  fetchMaterias(
    plugin: WorkspacePlugin,
    kernel: KernelAPI
  ): Promise<NormalizedMateria[]>
}

export interface AtividadesProvider {
  fetchAtividades(
    plugin: WorkspacePlugin,
    semestre: string,
    kernel: KernelAPI
  ): Promise<NormalizedAtividade[]>
}

export interface ConnectorDefinition {
  id: string
  displayName: string
  description?: string
  auth: ConnectorAuth
  materias: MateriasProvider
  atividades?: AtividadesProvider
  commands?: CommandDefinition[]
}

export interface ConnectorPlugin {
  load(kernel: KernelAPI): void
  unload?(): void
}

// ── Plugin manifest (for future user-installed plugins) ──────────────────────

export interface PluginManifest {
  id: string
  version: string
  displayName: string
  description?: string
  main: string
  type: 'connector' | 'view' | 'shortcut' | 'settings'
  kernelVersion: string
}
