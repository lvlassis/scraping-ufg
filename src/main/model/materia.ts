import { and, eq } from 'drizzle-orm'
import { getDb } from '../db'
import { materia, atividade } from '../db/schema'
import type { NormalizedMateria, NormalizedAtividade } from '../kernel/types'

export type Materia = typeof materia.$inferSelect
export type Atividade = typeof atividade.$inferSelect

export function getSemestreAtual(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  return month <= 6 ? `${year}.1` : `${year}.2`
}

export function insertMaterias(materias: NormalizedMateria[]): void {
  if (materias.length === 0) return
  getDb().insert(materia).values(materias).onConflictDoNothing().run()
}

export function getMateriasPorSemestre(semestre: string): Materia[] {
  return getDb().select().from(materia).where(eq(materia.semestre, semestre)).all()
}

export function insertAtividades(atividades: NormalizedAtividade[]): void {
  if (atividades.length === 0) return
  getDb().insert(atividade).values(atividades).onConflictDoNothing().run()
}

export function getAtividadesPorMateria(materiaNome: string, semestre: string): Atividade[] {
  return getDb()
    .select()
    .from(atividade)
    .where(and(eq(atividade.materia_nome, materiaNome), eq(atividade.semestre, semestre)))
    .all()
}
