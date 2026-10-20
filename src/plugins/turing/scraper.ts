import { request } from 'https'
import type { ConnectorCredential } from '../../main/kernel/types'

export interface TuringCourse {
  turingId: string
  nome: string
}

const BASE = 'https://turing.inf.ufg.br'

// ── HTTP helpers ──────────────────────────────────────────────────────────────

type RawResponse = {
  statusCode: number
  headers: Record<string, string | string[] | undefined>
  body: string
}

function rawRequest(
  url: string,
  options: { method?: string; headers?: Record<string, string>; body?: string }
): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const { hostname, pathname, search } = new URL(url)
    const path = pathname + search
    const method = options.method ?? 'GET'
    const req = request({ hostname, path, method, headers: options.headers ?? {} }, (res) => {
      let body = ''
      res.on('data', (chunk: Buffer) => (body += chunk))
      res.on('end', () =>
        resolve({
          statusCode: res.statusCode ?? 0,
          headers: res.headers as Record<string, string | string[] | undefined>,
          body,
        })
      )
    })
    req.on('error', reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

function parseSetCookies(headers: Record<string, string | string[] | undefined>): Record<string, string> {
  const raw = headers['set-cookie']
  if (!raw) return {}
  const entries = Array.isArray(raw) ? raw : [raw]
  const result: Record<string, string> = {}
  for (const entry of entries) {
    const eqIdx = entry.indexOf('=')
    if (eqIdx === -1) continue
    const name = entry.substring(0, eqIdx).trim()
    const value = entry.substring(eqIdx + 1).split(';')[0].trim()
    result[name] = value
  }
  return result
}

function toCookieHeader(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginViaHttp(
  username: string,
  password: string
): Promise<ConnectorCredential> {
  // Passo 1: GET login page → extrai logintoken e captura cookies de sessão pré-login
  const getRes = await rawRequest(`${BASE}/login/index.php`, {})
  console.log(`[turing] GET /login/index.php → ${getRes.statusCode}`)
  console.log(`[turing] GET Set-Cookie:`, getRes.headers['set-cookie'])

  if (getRes.statusCode !== 200) {
    throw new Error(`Página de login do Turing retornou status ${getRes.statusCode}`)
  }

  const tokenMatch = getRes.body.match(/name="logintoken"\s+value="([^"]+)"/)
  if (!tokenMatch) throw new Error('logintoken não encontrado na página de login do Turing')
  const logintoken = tokenMatch[1]
  console.log(`[turing] logintoken encontrado: ${logintoken.substring(0, 8)}...`)

  const sessionCookies = parseSetCookies(getRes.headers)
  console.log(`[turing] Cookies do GET:`, Object.keys(sessionCookies))

  // Passo 2: POST credenciais SEM seguir redirect para capturar Set-Cookie do 303
  const postBody = new URLSearchParams({ username, password, logintoken }).toString()
  console.log(`[turing] POST /login/index.php com cookies:`, Object.keys(sessionCookies))
  const postHeaders: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': String(Buffer.byteLength(postBody)),
  }
  if (Object.keys(sessionCookies).length > 0) {
    postHeaders['Cookie'] = toCookieHeader(sessionCookies)
  }

  const postRes = await rawRequest(`${BASE}/login/index.php`, {
    method: 'POST',
    headers: postHeaders,
    body: postBody,
  })

  console.log(`[turing] POST → status ${postRes.statusCode}, Location: ${postRes.headers['location'] ?? '(nenhum)'}`)
  console.log(`[turing] POST Set-Cookie:`, postRes.headers['set-cookie'])

  // Se voltou 200 com logintoken, credenciais inválidas
  if (postRes.statusCode === 200 && postRes.body.includes('name="logintoken"')) {
    throw new Error('Usuário ou senha inválidos')
  }

  if (postRes.statusCode < 300 || postRes.statusCode >= 400) {
    throw new Error(`Login retornou status inesperado: ${postRes.statusCode}`)
  }

  // Merge cookies do POST (novo MoodleSession autenticado chega aqui)
  Object.assign(sessionCookies, parseSetCookies(postRes.headers))

  // Segue a cadeia de redirects do Moodle (ex: testsession → /my/)
  // O Moodle faz um redirect intermediário para verificar que o browser aceita cookies
  let nextUrl = postRes.headers['location'] as string | undefined
  for (let i = 0; i < 5 && nextUrl; i++) {
    if (!nextUrl.startsWith('http')) nextUrl = `${BASE}${nextUrl}`
    console.log(`[turing] Seguindo redirect ${i + 1}: ${nextUrl}`)

    const redirectRes = await rawRequest(nextUrl, {
      headers: { Cookie: toCookieHeader(sessionCookies) },
    })
    console.log(`[turing] Redirect ${i + 1} → ${redirectRes.statusCode}, Location: ${redirectRes.headers['location'] ?? '(fim)'}`)
    Object.assign(sessionCookies, parseSetCookies(redirectRes.headers))

    if (redirectRes.statusCode >= 300 && redirectRes.statusCode < 400) {
      nextUrl = redirectRes.headers['location'] as string | undefined
    } else {
      break
    }
  }

  console.log(`[turing] Todos os cookies após login:`, Object.keys(sessionCookies))

  const moodleSession = sessionCookies['MoodleSession']
  if (!moodleSession) {
    const found = Object.keys(sessionCookies).join(', ') || 'nenhum'
    throw new Error(`Sessão Turing não obtida após login (cookies encontrados: ${found})`)
  }

  console.log(`[turing] MoodleSession obtido: ${moodleSession.substring(0, 8)}...`)

  return {
    MoodleSession: moodleSession,
    _username: username,
    _password: password,
  }
}

// ── Scraping ──────────────────────────────────────────────────────────────────

function credentialCookieHeader(credential: ConnectorCredential): string {
  return Object.entries(credential)
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

// net.fetch ignora o header Cookie passado manualmente (gerenciado pelo Chromium).
// Usamos rawRequest + seguimento manual de redirects para controle total dos cookies.
async function rawGet(url: string, cookieStr: string): Promise<string> {
  let currentUrl = url
  for (let i = 0; i < 5; i++) {
    const res = await rawRequest(currentUrl, { headers: { Cookie: cookieStr } })
    if (res.statusCode >= 300 && res.statusCode < 400) {
      const loc = res.headers['location'] as string | undefined
      if (!loc) break
      currentUrl = loc.startsWith('http') ? loc : `${BASE}${loc}`
    } else {
      if (res.statusCode !== 200) throw new Error(`Turing retornou status ${res.statusCode}`)
      return res.body
    }
  }
  throw new Error('Muitos redirecionamentos ao buscar dados do Turing')
}

export async function fetchCourses(credential: ConnectorCredential): Promise<TuringCourse[]> {
  const cookieSent = credentialCookieHeader(credential)
  console.log(`[turing] GET /my/ com cookies:`, cookieSent.replace(/=[^;]+/g, '=***'))

  const html = await rawGet(`${BASE}/my/`, cookieSent)
  console.log(`[turing] /my/ contém logintoken: ${html.includes('name="logintoken"')}`)
  console.log(`[turing] /my/ contém course_list: ${html.includes('course_list_in_block')}`)

  if (html.includes('name="logintoken"')) {
    throw new Error('Sessão Turing expirada')
  }

  const courses: TuringCourse[] = []
  const courseRe =
    /href="https:\/\/turing\.inf\.ufg\.br\/course\/view\.php\?id=(\d+)"[^>]*>([^<]+)<\/a>/g

  let match: RegExpExecArray | null
  while ((match = courseRe.exec(html)) !== null) {
    courses.push({ turingId: match[1], nome: match[2].trim() })
  }

  return courses
}
