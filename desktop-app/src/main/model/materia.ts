import { createHash } from 'crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { materia } from '../db/schema'

export type Materia = typeof materia.$inferSelect

export type ApiMateria = {
  nome: string
  local: string
  horario: string
}

export function getSemestreAtual(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  // jan–jun → semestre 1; jul–dez → semestre 2
  return month <= 6 ? `${year}.1` : `${year}.2`
}

function makeId(nome: string, local: string, horario: string, semestre: string): string {
  return createHash('sha256').update(nome + local + horario + semestre).digest('hex')
}

export function insertMaterias(apiMaterias: ApiMateria[]): void {
  const semestre = getSemestreAtual()
  const rows = apiMaterias.map((m) => ({
    id: makeId(m.nome, m.local, m.horario, semestre),
    nome: m.nome,
    local: m.local,
    horario: m.horario,
    semestre,
  }))
  getDb().insert(materia).values(rows).onConflictDoNothing().run()
}

export async function updateMaterias(cookies: string): Promise<void> {
  const url = new URL('http://127.0.0.1:8765/update')
  url.searchParams.set('cookies', cookies)

  const response = await fetch(url, { method: 'POST' })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${response.status}`)
  }

  const data = (await response.json()) as { materias: ApiMateria[] }
  insertMaterias(data.materias)
}

export function getMateriasPorSemestre(semestre: string): Materia[] {
  return getDb().select().from(materia).where(eq(materia.semestre, semestre)).all()
}
