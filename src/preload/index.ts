import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getAccounts: () => ipcRenderer.invoke('auth:getAccounts'),
  openSigaaLogin: () => ipcRenderer.invoke('auth:openSigaaLogin'),
  getCookies: (matricula: string) => ipcRenderer.invoke('auth:getCookies', matricula),
  refresh: (matricula: string) => ipcRenderer.invoke('auth:refresh', matricula),
  selectAccount: (matricula: string) => ipcRenderer.invoke('auth:selectAccount', matricula),
  logout: () => ipcRenderer.invoke('auth:logout'),
  removeAccount: (matricula: string) => ipcRenderer.invoke('auth:removeAccount', matricula),
  getMateriasPorSemestre: (semestre: string) => ipcRenderer.invoke('materia:getBySemestre', semestre),
  getAtividadesPorMateria: (materiaNome: string, semestre: string) => ipcRenderer.invoke('materia:getAtividades', materiaNome, semestre),
})
