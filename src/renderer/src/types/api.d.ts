export type Account = {
  matricula: string
  nome: string
}

export type Materia = {
  id: string
  nome: string
  local: string
  horario: string
  semestre: string
}

export type Atividade = {
  id: string
  tipo: string
  due: string | null
  nome: string
  materia_nome: string
  semestre: string
}

declare global {
  interface Window {
    api: {
      getAccounts(): Promise<Account[]>
      openSigaaLogin(): Promise<Account>
      refresh(matricula: string): Promise<void>
      selectAccount(matricula: string): Promise<Account>
      logout(): Promise<void>
      removeAccount(matricula: string): Promise<void>
      getMateriasPorSemestre(semestre: string): Promise<Materia[]>
      getAtividadesPorMateria(materiaNome: string, semestre: string): Promise<Atividade[]>
    }
  }
}
