import { createHash } from 'crypto'
import type {
  ConnectorPlugin, KernelAPI, NormalizedMateria, NormalizedAtividade, WorkspacePlugin,
} from '../../main/kernel/types'
import { openSigaaLoginWindow } from './auth'
import { callScraper } from './scraper'
import type { ApiMateria, ApiAtividade } from './types'

const CONNECTOR_ID = 'sigaa-ufg'

function toNormalizedMateria(semestre: string) {
  return (m: ApiMateria): NormalizedMateria => ({
    id: createHash('sha256').update(m.nome + m.local + m.horario + semestre).digest('hex'),
    nome: m.nome,
    local: m.local,
    horario: m.horario,
    semestre,
  })
}

function toNormalizedAtividade(semestre: string) {
  return (a: ApiAtividade): NormalizedAtividade => ({
    id: createHash('sha256').update(a.nome + a.materia + (a.due ?? '') + semestre).digest('hex'),
    tipo: a.tipo,
    due: a.due ?? null,
    nome: a.nome,
    materia_nome: a.materia,
    semestre,
  })
}

async function fetchAndStore(credential: Record<string, string>, kernel: KernelAPI): Promise<void> {
  const profile = await callScraper(credential)
  const semestre = kernel.data.getSemestreAtual()
  kernel.data.insertMaterias(profile.turmas.map(toNormalizedMateria(semestre)))
  kernel.data.insertAtividades((profile.atividades ?? []).map(toNormalizedAtividade(semestre)))
}

export const sigaaUfgPlugin: ConnectorPlugin = {
  load(kernel: KernelAPI) {
    kernel.registerConnector({
      id: CONNECTOR_ID,
      displayName: 'SIGAA UFG',
      description: 'Sistema Integrado de Gestão de Atividades Acadêmicas da UFG',

      auth: {
        method: 'browser-window',

        async login(kernel): Promise<WorkspacePlugin> {
          const credential = await openSigaaLoginWindow(kernel.electron)
          const profile = await callScraper(credential)
          await fetchAndStore(credential, kernel)
          return {
            connectorId: CONNECTOR_ID,
            enabled: true,
            credential,
            userId: profile.matricula,
            displayName: profile.nome,
          }
        },

        async refresh(workspaceId, plugin, kernel): Promise<void> {
          const credential = plugin.credential

          if (credential && Object.keys(credential).length > 0) {
            try {
              await fetchAndStore(credential, kernel)
              return
            } catch {
              // credential expired — fall through to re-login
            }
          }

          const newCredential = await openSigaaLoginWindow(kernel.electron)
          kernel.workspace.upsertPlugin(workspaceId, { ...plugin, credential: newCredential })
          await fetchAndStore(newCredential, kernel)
        },
      },

      materias: {
        async fetchMaterias(plugin, kernel): Promise<NormalizedMateria[]> {
          const profile = await callScraper(plugin.credential ?? {})
          const semestre = kernel.data.getSemestreAtual()
          return profile.turmas.map(toNormalizedMateria(semestre))
        },
      },

      atividades: {
        async fetchAtividades(plugin, semestre): Promise<NormalizedAtividade[]> {
          const profile = await callScraper(plugin.credential ?? {})
          return (profile.atividades ?? []).map(toNormalizedAtividade(semestre))
        },
      },

      commands: [
        {
          id: 'sigaa-ufg:refresh',
          label: 'Atualizar dados do SIGAA',
          defaultAccelerator: 'Ctrl+R',
          async execute(workspaceId, kernel): Promise<void> {
            const plugin = kernel.workspace.getPlugin(workspaceId, CONNECTOR_ID)
            if (!plugin?.enabled) return
            const credential = plugin.credential
            if (credential && Object.keys(credential).length > 0) {
              try {
                await fetchAndStore(credential, kernel)
                return
              } catch {
                // credential expired — fall through to re-login
              }
            }
            const newCredential = await openSigaaLoginWindow(kernel.electron)
            kernel.workspace.upsertPlugin(workspaceId, { ...plugin, credential: newCredential })
            await fetchAndStore(newCredential, kernel)
          },
        },
      ],
    })
  },
}
