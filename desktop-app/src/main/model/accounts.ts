import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { getDataDir } from '../db'

export type Account = { matricula: string; nome: string }

function getPath(): string {
  return join(getDataDir(), 'accounts.json')
}

export function getAccounts(): Account[] {
  try {
    return JSON.parse(readFileSync(getPath(), 'utf-8')) as Account[]
  } catch {
    return []
  }
}

export function upsertAccount(account: Account): void {
  const accounts = getAccounts()
  const idx = accounts.findIndex((a) => a.matricula === account.matricula)
  if (idx >= 0) accounts[idx] = account
  else accounts.push(account)
  writeFileSync(getPath(), JSON.stringify(accounts))
}
