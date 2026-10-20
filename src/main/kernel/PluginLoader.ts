import type { KernelAPI, ConnectorPlugin } from './types'
import { sigaaUfgPlugin } from '../../plugins/sigaa-ufg'
import { turingPlugin } from '../../plugins/turing'

const BUILT_IN_PLUGINS: ConnectorPlugin[] = [
  sigaaUfgPlugin,
  turingPlugin,
  // classroomPlugin,
]

export function loadPlugins(kernel: KernelAPI): void {
  for (const plugin of BUILT_IN_PLUGINS) {
    plugin.load(kernel)
  }
}
