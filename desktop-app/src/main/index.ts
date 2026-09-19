import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { spawn, ChildProcess } from 'child_process'
import { initDb } from './db'
import { getAccounts, upsertAccount, type Account } from './model/accounts'
import { getMateriasPorSemestre, insertMaterias, updateMaterias, type ApiMateria } from './model/materia'

const SIGAA_LOGIN_URL = 'https://sigaa.sistemas.ufg.br/sigaa/verTelaLogin.do'
const SIGAA_PORTAL_PATH = '/portais/discente/discente.jsf'

let sigaaApi: ChildProcess | null = null

function startSigaaApi(): void {
  const binary = join(process.resourcesPath, 'sigaa-api')
  sigaaApi = spawn(binary)
  sigaaApi.stdout?.on('data', (d) => process.stdout.write(`[sigaa-api] ${d}`))
  sigaaApi.stderr?.on('data', (d) => process.stderr.write(`[sigaa-api] ${d}`))
}

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

function openSigaaLoginWindow(): Promise<string> {
  return new Promise((resolve, reject) => {
    const loginWin = new BrowserWindow({
      width: 900,
      height: 700,
      title: 'Login SIGAA',
      webPreferences: {
        // Sessão não-persistente: começa limpa a cada login, sem cookies residuais
        partition: 'sigaa-login',
      },
    })

    loginWin.loadURL(SIGAA_LOGIN_URL)

    let settled = false

    // did-finish-load garante que o JS da página executou e todos os cookies foram setados
    loginWin.webContents.on('did-finish-load', async () => {
      if (settled) return
      if (!loginWin.webContents.getURL().includes(SIGAA_PORTAL_PATH)) return

      settled = true

      try {
        const allCookies = await loginWin.webContents.session.cookies.get({})
        console.log('[debug] cookies após did-finish-load:')
        allCookies.forEach((c) => console.log(`  ${c.domain} | ${c.name} = ${c.value.slice(0, 40)}...`))

        const jsess = allCookies.find((c) => c.name === 'JSESSIONID')
        const sess = allCookies.find((c) => c.name === '_ufg_br_sess')

        if (!jsess) {
          throw new Error('JSESSIONID não encontrado após login')
        }

        const cookieStr = sess
          ? `_ufg_br_sess=${sess.value}; JSESSIONID=${jsess.value}`
          : `JSESSIONID=${jsess.value}`

        resolve(cookieStr)
        loginWin.close()
      } catch (e) {
        reject(e)
        loginWin.close()
      }
    })

    loginWin.on('closed', () => {
      if (!settled) reject(new Error('Login cancelado pelo usuário'))
    })
  })
}

async function performLogin(cookies: string): Promise<Account> {
  const url = new URL('http://127.0.0.1:8765/update')
  url.searchParams.set('cookies', cookies)

  const res = await fetch(url, { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`)
  }

  const data = (await res.json()) as { matricula: string; nome: string; materias: ApiMateria[] }

  initDb(data.matricula)
  upsertAccount({ matricula: data.matricula, nome: data.nome })
  insertMaterias(data.materias)

  return { matricula: data.matricula, nome: data.nome }
}

app.whenReady().then(() => {
  ipcMain.handle('auth:getAccounts', (): Account[] => getAccounts())

  ipcMain.handle('auth:openSigaaLogin', async (): Promise<Account> => {
    const cookies = await openSigaaLoginWindow()
    return performLogin(cookies)
  })

  // Mantido para o painel de atualização manual no Dashboard
  ipcMain.handle('auth:login', (_, cookies: string): Promise<Account> => performLogin(cookies))

  ipcMain.handle('auth:selectAccount', (_, matricula: string): Account | null => {
    initDb(matricula)
    return getAccounts().find((a) => a.matricula === matricula) ?? null
  })

  ipcMain.handle('materia:update', (_, cookies: string) => updateMaterias(cookies))
  ipcMain.handle('materia:getBySemestre', (_, semestre: string) => getMateriasPorSemestre(semestre))

  if (app.isPackaged) startSigaaApi()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  sigaaApi?.kill()
  if (process.platform !== 'darwin') app.quit()
})
