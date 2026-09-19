import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getAccounts: () => ipcRenderer.invoke('auth:getAccounts'),
  openSigaaLogin: () => ipcRenderer.invoke('auth:openSigaaLogin'),
  login: (cookies: string) => ipcRenderer.invoke('auth:login', cookies),
  selectAccount: (matricula: string) => ipcRenderer.invoke('auth:selectAccount', matricula),
  logout: () => ipcRenderer.invoke('auth:logout'),
  removeAccount: (matricula: string) => ipcRenderer.invoke('auth:removeAccount', matricula),
  updateMaterias: (cookies: string) => ipcRenderer.invoke('materia:update', cookies),
  getMateriasPorSemestre: (semestre: string) => ipcRenderer.invoke('materia:getBySemestre', semestre),
})
