import { createHash } from 'crypto'
import type {
  ConnectorPlugin, KernelAPI, NormalizedMateria, WorkspacePlugin,
} from '../../main/kernel/types'
import { loginViaHttp, fetchCourses, type TuringCourse } from './scraper'

const CONNECTOR_ID = 'turing'

function toNormalizedMateria(semestre: string) {
  return (c: TuringCourse): NormalizedMateria => ({
    id: createHash('sha256').update(c.nome + semestre).digest('hex'),
    nome: c.nome,
    local: '',
    horario: '',
    semestre,
  })
}

async function fetchAndStore(credential: Record<string, string>, kernel: KernelAPI): Promise<void> {
  const courses = await fetchCourses(credential)
  console.log('[turing] Matérias obtidas:', courses.map((c) => c.nome))
  const semestre = kernel.data.getSemestreAtual()
  kernel.data.insertMaterias(courses.map(toNormalizedMateria(semestre)))
}

export const turingPlugin: ConnectorPlugin = {
  load(kernel: KernelAPI) {
    kernel.registerConnector({
      id: CONNECTOR_ID,
      displayName: 'Turing UFG',
      description: 'Plataforma de Ensino Moodle do Instituto de Informática da UFG',

      auth: {
        method: 'session',

        async login(kernel, ...extra): Promise<WorkspacePlugin> {
          const [username, password] = extra as [string, string]
          if (!username || !password) throw new Error('Usuário e senha são obrigatórios')

          const credential = await loginViaHttp(username, password)
          await fetchAndStore(credential, kernel)

          return {
            connectorId: CONNECTOR_ID,
            enabled: true,
            credential,
            displayName: username,
          }
        },

        async refresh(workspaceId, plugin, kernel): Promise<void> {
          const { _username, _password } = plugin.credential ?? {}
          if (!_username || !_password) throw new Error('Credenciais Turing não encontradas')

          const credential = await loginViaHttp(_username, _password)
          kernel.workspace.upsertPlugin(workspaceId, { ...plugin, credential })
          await fetchAndStore(credential, kernel)
        },
      },

      materias: {
        async fetchMaterias(plugin, kernel): Promise<NormalizedMateria[]> {
          const courses = await fetchCourses(plugin.credential ?? {})
          const semestre = kernel.data.getSemestreAtual()
          return courses.map(toNormalizedMateria(semestre))
        },
      },
    })
  },
}
