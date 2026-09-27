import { createHash } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../db'
import { materia, atividade } from '../db/schema'
import { callScraper } from '../scraper'

export type Materia = typeof materia.$inferSelect
export type Atividade = typeof atividade.$inferSelect

export type ApiMateria = {
  nome: string
  local: string
  horario: string
}

export type ApiAtividade = {
  tipo: string
  due: string | null
  nome: string
  materia: string
}

export type ApiResponse = {
  matricula: string
  nome: string
  nome_titulo: string
  curso: string
  nivel: string
  status: string
  email: string
  entrada: string
  ip: number
  ti: number
  ta: number
  qr: number
  mge: number
  mre: number
  pmf: number
  ch_exigida: number
  ch_cursada: number
  turmas: ApiMateria[]
  atividades: ApiAtividade[]
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
  const data = await callScraper(cookies)
  const semestre = getSemestreAtual()
  insertMaterias(data.turmas)
  insertAtividades(data.atividades ?? [], semestre)
}

export function getMateriasPorSemestre(semestre: string): Materia[] {
  return getDb().select().from(materia).where(eq(materia.semestre, semestre)).all()
}

export function insertAtividades(atividades: ApiAtividade[], semestre: string): void {
  if (atividades.length === 0) return
  const rows = atividades.map((a) => ({
    id: createHash('sha256').update(a.nome + a.materia + (a.due ?? '') + semestre).digest('hex'),
    tipo: a.tipo,
    due: a.due ?? null,
    nome: a.nome,
    materia_nome: a.materia,
    semestre,
  }))
  getDb().insert(atividade).values(rows).onConflictDoNothing().run()
}

export function getAtividadesPorMateria(materiaNome: string, semestre: string): Atividade[] {
  return getDb()
    .select()
    .from(atividade)
    .where(and(eq(atividade.materia_nome, materiaNome), eq(atividade.semestre, semestre)))
    .all()
}
