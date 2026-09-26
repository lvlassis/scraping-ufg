import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const materia = sqliteTable(
  'materia', {
    id: text('id').notNull(),
    nome: text('nome').notNull(),
    local: text('local').notNull(),
    horario: text('horario').notNull(),
    semestre: text('semestre').notNull(),
  },
  (t) => [uniqueIndex('materia_id_idx').on(t.id)]
)

export const atividade = sqliteTable(
  'atividade', {
    id: text('id').notNull(),
    tipo: text('tipo').notNull(),
    due: text('due'),
    nome: text('nome').notNull(),
    materia_nome: text('materia_nome').notNull(),
    semestre: text('semestre').notNull(),
  },
  (t) => [uniqueIndex('atividade_id_idx').on(t.id)]
)
