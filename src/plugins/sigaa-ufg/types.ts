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
