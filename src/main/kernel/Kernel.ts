import { ipcMain, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { rmSync } from 'fs'
import type {
  KernelAPI, ElectronBridge, WorkspaceStore, DataStore, IpcBus, ShortcutsStore,
  ConnectorDefinition, ConnectorInfo, ConnectorStatus,
  Workspace, WorkspacePlugin,
} from './types'
import type { CommandInfo, StoredCommand } from './command'
import {
  getWorkspaces, createWorkspace, removeWorkspace,
  getPlugins, upsertPlugin, removePlugin, getPlugin,
} from '../model/workspaces'
import {
  getShortcuts, setShortcut, removeShortcut, applyDefaultShortcuts,
} from '../model/shortcuts'
import {
  insertMaterias, insertAtividades,
  getMateriasPorSemestre, getAtividadesPorMateria, getSemestreAtual,
} from '../model/materia'
import { initDb, closeDb, getDataDir } from '../db'

export class Kernel implements KernelAPI {
  private connectors = new Map<string, ConnectorDefinition>()
  private commands = new Map<string, StoredCommand>()
  private currentWorkspaceId: string | null = null

  readonly electron: ElectronBridge = {
    createBrowserWindow(options) {
      return new BrowserWindow({
        width: options.width ?? 900,
        height: options.height ?? 700,
        title: options.title,
        webPreferences: { partition: options.partition },
      })
    },
    openExternal(url) {
      return shell.openExternal(url)
    },
  }

  readonly workspace: WorkspaceStore = {
    getWorkspaces: () => getWorkspaces(),
    createWorkspace: (name) => createWorkspace(name),
    removeWorkspace: (id) => removeWorkspace(id),
    getPlugins: (id) => getPlugins(id),
    upsertPlugin: (wsId, plugin) => upsertPlugin(wsId, plugin),
    removePlugin: (wsId, connectorId) => removePlugin(wsId, connectorId),
    getPlugin: (wsId, connectorId) => getPlugin(wsId, connectorId),
  }

  readonly data: DataStore = {
    insertMaterias: (m) => insertMaterias(m),
    insertAtividades: (a) => insertAtividades(a),
    getMateriasPorSemestre: (s) => getMateriasPorSemestre(s),
    getAtividadesPorMateria: (n, s) => getAtividadesPorMateria(n, s),
    getSemestreAtual: () => getSemestreAtual(),
  }

  readonly shortcuts: ShortcutsStore = {
    getShortcuts: (wsId) => getShortcuts(wsId),
    setShortcut: (wsId, commandId, accelerator) => setShortcut(wsId, commandId, accelerator),
    removeShortcut: (wsId, commandId) => removeShortcut(wsId, commandId),
  }

  registerConnector(definition: ConnectorDefinition): void {
    this.connectors.set(definition.id, definition)
    for (const cmd of definition.commands ?? []) {
      this.commands.set(cmd.id, { ...cmd, connectorId: definition.id, connectorDisplayName: definition.displayName })
    }
  }

  registerCommand(definition: StoredCommand): void {
    this.commands.set(definition.id, definition)
  }

  getIpcBus(connectorId: string): IpcBus {
    return {
      handle: (channel, handler) => {
        ipcMain.handle(`connector:${connectorId}:${channel}`, (_, ...args) =>
          handler(...args)
        )
      },
    }
  }

  private getConnectorInfos(): ConnectorInfo[] {
    return [...this.connectors.values()].map((c) => ({
      id: c.id,
      displayName: c.displayName,
      description: c.description,
      authMethod: c.auth.method,
    }))
  }

  private getCommandInfos(): CommandInfo[] {
    return [...this.commands.values()].map((c) => ({
      id: c.id,
      label: c.label,
      connectorId: c.connectorId,
      connectorDisplayName: c.connectorDisplayName,
    }))
  }

  private toConnectorStatus(plugin: WorkspacePlugin): ConnectorStatus {
    const def = this.connectors.get(plugin.connectorId)
    return {
      connectorId: plugin.connectorId,
      connectorDisplayName: def?.displayName ?? plugin.connectorId,
      userId: plugin.userId,
      displayName: plugin.displayName,
      enabled: plugin.enabled,
    }
  }

  wireIpcHandlers(): void {
    ipcMain.handle('kernel:getConnectors', () => this.getConnectorInfos())

    ipcMain.handle('kernel:getWorkspaces', () => getWorkspaces())

    ipcMain.handle('kernel:createWorkspace', (_, name: string): Workspace => {
      const ws = createWorkspace(name)
      initDb(ws.id)
      this.currentWorkspaceId = ws.id
      applyDefaultShortcuts(ws.id, [...this.commands.values()])
      return ws
    })

    ipcMain.handle('kernel:openWorkspace', (_, id: string): Workspace | null => {
      const ws = getWorkspaces().find((w) => w.id === id)
      if (!ws) return null
      initDb(id)
      this.currentWorkspaceId = id
      return ws
    })

    ipcMain.handle('kernel:closeWorkspace', (): void => {
      closeDb()
      this.currentWorkspaceId = null
    })

    ipcMain.handle('kernel:removeWorkspace', (_, id: string): void => {
      closeDb()
      try { rmSync(join(getDataDir(), `${id}.sqlite`)) } catch {}
      removeWorkspace(id)
      if (this.currentWorkspaceId === id) this.currentWorkspaceId = null
    })

    ipcMain.handle('kernel:addPlugin', async (_, connectorId: string, ...extra: unknown[]): Promise<ConnectorStatus> => {
      const wsId = this.currentWorkspaceId
      if (!wsId) throw new Error('Nenhum workspace ativo')
      const def = this.connectors.get(connectorId)
      if (!def) throw new Error(`Unknown connector: ${connectorId}`)
      const plugin = await def.auth.login(this, ...extra)
      upsertPlugin(wsId, plugin)
      return this.toConnectorStatus(plugin)
    })

    ipcMain.handle('kernel:getPlugins', (): ConnectorStatus[] => {
      if (!this.currentWorkspaceId) return []
      return getPlugins(this.currentWorkspaceId).map((p) => this.toConnectorStatus(p))
    })

    ipcMain.handle('kernel:refreshAll', async (): Promise<void> => {
      const wsId = this.currentWorkspaceId
      if (!wsId) throw new Error('Nenhum workspace ativo')
      const plugins = getPlugins(wsId).filter((p) => p.enabled)
      for (const plugin of plugins) {
        const def = this.connectors.get(plugin.connectorId)
        if (!def) continue
        await def.auth.refresh(wsId, plugin, this)
      }
    })

    ipcMain.handle('kernel:refreshPlugin', async (_, connectorId: string): Promise<void> => {
      const wsId = this.currentWorkspaceId
      if (!wsId) throw new Error('Nenhum workspace ativo')
      const plugin = getPlugin(wsId, connectorId)
      if (!plugin) throw new Error(`Plugin not configured: ${connectorId}`)
      const def = this.connectors.get(plugin.connectorId)
      if (!def) throw new Error(`Unknown connector: ${connectorId}`)
      await def.auth.refresh(wsId, plugin, this)
    })

    ipcMain.handle('kernel:removePlugin', (_, connectorId: string): void => {
      const wsId = this.currentWorkspaceId
      if (!wsId) throw new Error('Nenhum workspace ativo')
      removePlugin(wsId, connectorId)
    })

    ipcMain.handle('kernel:togglePlugin', (_, connectorId: string, enabled: boolean): void => {
      const wsId = this.currentWorkspaceId
      if (!wsId) throw new Error('Nenhum workspace ativo')
      const plugin = getPlugin(wsId, connectorId)
      if (!plugin) throw new Error(`Plugin not configured: ${connectorId}`)
      upsertPlugin(wsId, { ...plugin, enabled })
    })

    ipcMain.handle('data:getMateriasPorSemestre', (_, semestre: string) =>
      getMateriasPorSemestre(semestre)
    )

    ipcMain.handle('data:getAtividadesPorMateria', (_, nome: string, semestre: string) =>
      getAtividadesPorMateria(nome, semestre)
    )

    ipcMain.handle('kernel:getCommands', () => this.getCommandInfos())

    ipcMain.handle('kernel:getShortcuts', () => {
      if (!this.currentWorkspaceId) return []
      return getShortcuts(this.currentWorkspaceId)
    })

    ipcMain.handle('kernel:setShortcut', (_, commandId: string, accelerator: string): void => {
      const wsId = this.currentWorkspaceId
      if (!wsId) throw new Error('Nenhum workspace ativo')
      setShortcut(wsId, commandId, accelerator)
    })

    ipcMain.handle('kernel:removeShortcut', (_, commandId: string): void => {
      const wsId = this.currentWorkspaceId
      if (!wsId) throw new Error('Nenhum workspace ativo')
      removeShortcut(wsId, commandId)
    })

    ipcMain.handle('kernel:executeCommand', async (_, commandId: string): Promise<void> => {
      const wsId = this.currentWorkspaceId
      if (!wsId) throw new Error('Nenhum workspace ativo')
      const cmd = this.commands.get(commandId)
      if (!cmd) throw new Error(`Unknown command: ${commandId}`)
      await cmd.execute?.(wsId, this)
    })
  }
}
