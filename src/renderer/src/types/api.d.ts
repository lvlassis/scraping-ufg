export type Workspace = {
  id: string
  name: string
  createdAt: string
}

export type ConnectorInfo = {
  id: string
  displayName: string
  description?: string
  authMethod: 'browser-window' | 'oauth' | 'session'
}

export type ConnectorStatus = {
  connectorId: string
  connectorDisplayName: string
  userId?: string
  displayName?: string
  enabled: boolean
}

export type Materia = {
  id: string
  nome: string
  local: string
  horario: string
  semestre: string
}

export type Atividade = {
  id: string
  tipo: string
  due: string | null
  nome: string
  materia_nome: string
  semestre: string
}

export type CommandInfo = {
  id: string
  label: string
  connectorId: string
  connectorDisplayName: string
}

export type WorkspaceShortcut = {
  commandId: string
  accelerator: string
}

declare global {
  interface Window {
    api: {
      // Workspace management
      getWorkspaces(): Promise<Workspace[]>
      createWorkspace(name: string): Promise<Workspace>
      openWorkspace(id: string): Promise<Workspace | null>
      closeWorkspace(): Promise<void>
      removeWorkspace(id: string): Promise<void>

      // Plugin management
      getConnectors(): Promise<ConnectorInfo[]>
      getPlugins(): Promise<ConnectorStatus[]>
      addPlugin(connectorId: string, ...extra: unknown[]): Promise<ConnectorStatus>
      refreshAll(): Promise<void>
      refreshPlugin(connectorId: string): Promise<void>
      removePlugin(connectorId: string): Promise<void>
      togglePlugin(connectorId: string, enabled: boolean): Promise<void>

      // Data
      getMateriasPorSemestre(semestre: string): Promise<Materia[]>
      getAtividadesPorMateria(materiaNome: string, semestre: string): Promise<Atividade[]>

      // Commands & shortcuts
      getCommands(): Promise<CommandInfo[]>
      getShortcuts(): Promise<WorkspaceShortcut[]>
      setShortcut(commandId: string, accelerator: string): Promise<void>
      removeShortcut(commandId: string): Promise<void>
      executeCommand(commandId: string): Promise<void>
    }
  }
}
