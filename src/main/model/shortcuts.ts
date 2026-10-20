import { readRecords, writeRecords } from './workspaces'
import type { WorkspaceShortcut } from '../kernel/types'
import type { StoredCommand } from '../kernel/command'

export function getShortcuts(workspaceId: string): WorkspaceShortcut[] {
  return readRecords().find((w) => w.id === workspaceId)?.shortcuts ?? []
}

export function setShortcut(workspaceId: string, commandId: string, accelerator: string): void {
  const records = readRecords()
  const ws = records.find((w) => w.id === workspaceId)
  if (!ws) throw new Error(`Workspace not found: ${workspaceId}`)
  if (!ws.shortcuts) ws.shortcuts = []
  const idx = ws.shortcuts.findIndex((s) => s.commandId === commandId)
  if (idx >= 0) ws.shortcuts[idx] = { commandId, accelerator }
  else ws.shortcuts.push({ commandId, accelerator })
  writeRecords(records)
}

export function removeShortcut(workspaceId: string, commandId: string): void {
  const records = readRecords()
  const ws = records.find((w) => w.id === workspaceId)
  if (!ws) return
  ws.shortcuts = (ws.shortcuts ?? []).filter((s) => s.commandId !== commandId)
  writeRecords(records)
}

export function applyDefaultShortcuts(workspaceId: string, commands: StoredCommand[]): void {
  const records = readRecords()
  const ws = records.find((w) => w.id === workspaceId)
  if (!ws) return
  if (!ws.shortcuts) ws.shortcuts = []
  for (const cmd of commands) {
    if (!cmd.defaultAccelerator) continue
    const alreadyBound = ws.shortcuts.some((s) => s.commandId === cmd.id)
    if (!alreadyBound) ws.shortcuts.push({ commandId: cmd.id, accelerator: cmd.defaultAccelerator })
  }
  writeRecords(records)
}
