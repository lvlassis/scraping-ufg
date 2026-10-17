import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { getDataDir } from '../db'

export type Account = { matricula: string; nome: string }

type AccountRecord = Account & { cookies?: string }

function getPath(): string {
  return join(getDataDir(), 'accounts.json')
}

function readRecords(): AccountRecord[] {
  try {
    return JSON.parse(readFileSync(getPath(), 'utf-8')) as AccountRecord[]
  } catch {
    return []
  }
}

function writeRecords(records: AccountRecord[]): void {
  writeFileSync(getPath(), JSON.stringify(records))
}

export function getAccounts(): Account[] {
  return readRecords().map(({ matricula, nome }) => ({ matricula, nome }))
}

export function upsertAccount(account: Account): void {
  const records = readRecords()
  const idx = records.findIndex((a) => a.matricula === account.matricula)
  if (idx >= 0) records[idx] = { ...records[idx], ...account }
  else records.push(account)
  writeRecords(records)
}

export function saveCookies(matricula: string, cookies: string): void {
  const records = readRecords()
  const idx = records.findIndex((a) => a.matricula === matricula)
  if (idx >= 0) records[idx].cookies = cookies
  writeRecords(records)
}

export function getCookies(matricula: string): string | undefined {
  return readRecords().find((a) => a.matricula === matricula)?.cookies
}

export function removeAccount(matricula: string): void {
  writeRecords(readRecords().filter((a) => a.matricula !== matricula))
}
