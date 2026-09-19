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
