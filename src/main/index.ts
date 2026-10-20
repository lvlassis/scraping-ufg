import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { Kernel } from './kernel/Kernel'
import { loadPlugins } from './kernel/PluginLoader'
import { registerBuiltinCommands } from './kernel/builtinCommands'
import { migrateToWorkspaces } from './model/workspaces'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  migrateToWorkspaces()

  const kernel = new Kernel()
  loadPlugins(kernel)
  registerBuiltinCommands(kernel)
  kernel.wireIpcHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
