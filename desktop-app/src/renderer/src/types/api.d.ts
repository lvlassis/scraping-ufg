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

declare global {
  interface Window {
    api: {
      getAccounts(): Promise<Account[]>
      openSigaaLogin(): Promise<Account>
      login(cookies: string): Promise<Account>
      selectAccount(matricula: string): Promise<Account>
      logout(): Promise<void>
      removeAccount(matricula: string): Promise<void>
      updateMaterias(cookies: string): Promise<void>
      getMateriasPorSemestre(semestre: string): Promise<Materia[]>
    }
  }
}
