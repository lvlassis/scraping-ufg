import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Workspace management
  getWorkspaces: () => ipcRenderer.invoke('kernel:getWorkspaces'),
  createWorkspace: (name: string) => ipcRenderer.invoke('kernel:createWorkspace', name),
  openWorkspace: (id: string) => ipcRenderer.invoke('kernel:openWorkspace', id),
  closeWorkspace: () => ipcRenderer.invoke('kernel:closeWorkspace'),
  removeWorkspace: (id: string) => ipcRenderer.invoke('kernel:removeWorkspace', id),

  // Plugin management (within current workspace)
  getConnectors: () => ipcRenderer.invoke('kernel:getConnectors'),
  getPlugins: () => ipcRenderer.invoke('kernel:getPlugins'),
  addPlugin: (connectorId: string, ...extra: unknown[]) => ipcRenderer.invoke('kernel:addPlugin', connectorId, ...extra),
  refreshAll: () => ipcRenderer.invoke('kernel:refreshAll'),
  refreshPlugin: (connectorId: string) => ipcRenderer.invoke('kernel:refreshPlugin', connectorId),
  removePlugin: (connectorId: string) => ipcRenderer.invoke('kernel:removePlugin', connectorId),
  togglePlugin: (connectorId: string, enabled: boolean) => ipcRenderer.invoke('kernel:togglePlugin', connectorId, enabled),

  // Data
  getMateriasPorSemestre: (semestre: string) => ipcRenderer.invoke('data:getMateriasPorSemestre', semestre),
  getAtividadesPorMateria: (materiaNome: string, semestre: string) => ipcRenderer.invoke('data:getAtividadesPorMateria', materiaNome, semestre),

  // Commands & shortcuts
  getCommands: () => ipcRenderer.invoke('kernel:getCommands'),
  getShortcuts: () => ipcRenderer.invoke('kernel:getShortcuts'),
  setShortcut: (commandId: string, accelerator: string) => ipcRenderer.invoke('kernel:setShortcut', commandId, accelerator),
  removeShortcut: (commandId: string) => ipcRenderer.invoke('kernel:removeShortcut', commandId),
  executeCommand: (commandId: string) => ipcRenderer.invoke('kernel:executeCommand', commandId),
})
