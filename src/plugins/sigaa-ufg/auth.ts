import type { ElectronBridge, ConnectorCredential } from '../../main/kernel/types'

const SIGAA_LOGIN_URL = 'https://sigaa.sistemas.ufg.br/sigaa/verTelaLogin.do'
const SIGAA_PORTAL_PATH = '/portais/discente/discente.jsf'

export function openSigaaLoginWindow(bridge: ElectronBridge): Promise<ConnectorCredential> {
  return new Promise((resolve, reject) => {
    const loginWin = bridge.createBrowserWindow({
      partition: 'sigaa-login',
      title: 'Login SIGAA',
      width: 900,
      height: 700,
    })

    loginWin.loadURL(SIGAA_LOGIN_URL)

    let settled = false

    loginWin.webContents.on('did-finish-load', async () => {
      if (settled) return
      if (!loginWin.webContents.getURL().includes(SIGAA_PORTAL_PATH)) return

      settled = true

      try {
        const allCookies = await loginWin.webContents.session.cookies.get({})

        const jsess = allCookies.find((c) => c.name === 'JSESSIONID')
        const sess = allCookies.find((c) => c.name === '_ufg_br_sess')

        if (!jsess) throw new Error('JSESSIONID não encontrado após login')

        const credential: ConnectorCredential = { JSESSIONID: jsess.value }
        if (sess) credential['_ufg_br_sess'] = sess.value

        resolve(credential)
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
