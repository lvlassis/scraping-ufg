import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import { mkdirSync } from 'fs'
import { join } from 'path'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>

let _sqlite: Database.Database | null = null
let _db: Db | null = null

export function getDataDir(): string {
  return join(app.getPath('home'), '.local', 'share', 'sigaa-desktop')
}

export function getDb(): Db {
  if (!_db) throw new Error('DB não inicializado — chame initDb() primeiro')
  return _db
}

export function closeDb(): void {
  _sqlite?.close()
  _sqlite = null
  _db = null
}

export function initDb(matricula: string): void {
  _sqlite?.close()

  const dataDir = getDataDir()
  mkdirSync(dataDir, { recursive: true })

  _sqlite = new Database(join(dataDir, `${matricula}.sqlite`))
  _db = drizzle(_sqlite, { schema })

  const migrationsFolder = app.isPackaged
    ? join(process.resourcesPath, 'migrations')
    : join(__dirname, '../../src/main/db/migrations')

  migrate(_db, { migrationsFolder })
}
