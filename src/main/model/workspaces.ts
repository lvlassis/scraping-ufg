import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { getDataDir } from '../db'
import type { Workspace, WorkspacePlugin, WorkspaceRecord, ConnectorCredential } from '../kernel/types'

function getPath(): string {
  return join(getDataDir(), 'workspaces.json')
}

export function readRecords(): WorkspaceRecord[] {
  try {
    return JSON.parse(readFileSync(getPath(), 'utf-8')) as WorkspaceRecord[]
  } catch {
    return []
  }
}

export function writeRecords(records: WorkspaceRecord[]): void {
  writeFileSync(getPath(), JSON.stringify(records))
}

export function getWorkspaces(): Workspace[] {
  return readRecords().map(({ id, name, createdAt }) => ({ id, name, createdAt }))
}

export function createWorkspace(name: string): Workspace {
  const id = `ws_${randomUUID().replace(/-/g, '').slice(0, 12)}`
  const ws: WorkspaceRecord = { id, name, createdAt: new Date().toISOString(), plugins: [] }
  const records = readRecords()
  records.push(ws)
  writeRecords(records)
  return { id, name, createdAt: ws.createdAt }
}

export function removeWorkspace(id: string): void {
  writeRecords(readRecords().filter((w) => w.id !== id))
}

export function getPlugins(workspaceId: string): WorkspacePlugin[] {
  return readRecords().find((w) => w.id === workspaceId)?.plugins ?? []
}

export function upsertPlugin(workspaceId: string, plugin: WorkspacePlugin): void {
  const records = readRecords()
  const ws = records.find((w) => w.id === workspaceId)
  if (!ws) throw new Error(`Workspace not found: ${workspaceId}`)
  const idx = ws.plugins.findIndex((p) => p.connectorId === plugin.connectorId)
  if (idx >= 0) ws.plugins[idx] = plugin
  else ws.plugins.push(plugin)
  writeRecords(records)
}

export function removePlugin(workspaceId: string, connectorId: string): void {
  const records = readRecords()
  const ws = records.find((w) => w.id === workspaceId)
  if (!ws) return
  ws.plugins = ws.plugins.filter((p) => p.connectorId !== connectorId)
  writeRecords(records)
}

export function getPlugin(workspaceId: string, connectorId: string): WorkspacePlugin | undefined {
  return getPlugins(workspaceId).find((p) => p.connectorId === connectorId)
}

function parseCookieStr(cookies: string | undefined): ConnectorCredential {
  if (!cookies) return {}
  return Object.fromEntries(
    cookies.split('; ').flatMap((pair) => {
      const eq = pair.indexOf('=')
      if (eq < 0) return []
      return [[pair.slice(0, eq).trim(), pair.slice(eq + 1).trim()]]
    })
  )
}

// Migrate from legacy accounts.json → one workspace with all accounts as plugins.
// Also handles the pre-microkernel format {matricula, nome, cookies}.
export function migrateToWorkspaces(): void {
  if (existsSync(getPath())) return

  const accountsPath = join(getDataDir(), 'accounts.json')
  let raw: Record<string, unknown>[]
  try {
    raw = JSON.parse(readFileSync(accountsPath, 'utf-8')) as Record<string, unknown>[]
  } catch {
    return
  }
  if (!Array.isArray(raw) || raw.length === 0) return

  const isLegacy = !('connectorId' in raw[0])

  const plugins: WorkspacePlugin[] = raw.map((r) => {
    if (isLegacy) {
      return {
        connectorId: 'sigaa-ufg',
        enabled: true,
        credential: parseCookieStr(r['cookies'] as string | undefined),
        userId: String(r['matricula']),
        displayName: String(r['nome']),
      }
    }
    return {
      connectorId: String(r['connectorId']),
      enabled: true,
      credential: r['credential'] as ConnectorCredential | undefined,
      userId: r['userId'] ? String(r['userId']) : undefined,
      displayName: r['displayName'] ? String(r['displayName']) : undefined,
    }
  })

  const wsId = 'ws_migrated'
  const firstName = plugins[0]?.displayName ?? 'Meu Workspace'
  const ws: WorkspaceRecord = {
    id: wsId,
    name: firstName,
    createdAt: new Date().toISOString(),
    plugins,
  }
  writeRecords([ws])

  // Rename first matching SQLite to the workspace ID
  const dataDir = getDataDir()
  for (const r of raw) {
    const oldNames = isLegacy
      ? [`${String(r['matricula'])}.sqlite`, `sigaa-ufg_${String(r['matricula'])}.sqlite`]
      : [`${String(r['connectorId'])}_${String(r['userId'])}.sqlite`]

    for (const oldName of oldNames) {
      try {
        renameSync(join(dataDir, oldName), join(dataDir, `${wsId}.sqlite`))
        return // migrated successfully
      } catch {}
    }
  }
}
