export type Urgencia = 'critica' | 'alta' | 'media' | 'passada' | 'sem-data'

export function diasRestantes(due: string | null): number | null {
  if (!due) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const vence = new Date(due)
  vence.setHours(0, 0, 0, 0)
  return Math.round((vence.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export function urgencia(due: string | null): Urgencia {
  const d = diasRestantes(due)
  if (d === null) return 'sem-data'
  if (d < 0) return 'passada'
  if (d <= 2) return 'critica'
  if (d <= 7) return 'alta'
  return 'media'
}

export function labelRelativo(due: string | null): string {
  const d = diasRestantes(due)
  if (d === null) return 'Sem data'
  if (d < 0) return 'Encerrado'
  if (d === 0) return 'Hoje!'
  if (d === 1) return 'Amanhã'
  if (d <= 7) return `Em ${d} dias`
  const s = Math.floor(d / 7)
  return `Em ${s} semana${s > 1 ? 's' : ''}`
}

export function isProva(tipo: string): boolean {
  return tipo === 'prova'
}
