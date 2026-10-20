import type { KernelAPI } from './types'

export function registerBuiltinCommands(kernel: KernelAPI): void {
  kernel.registerCommand({
    id: 'navigation:back',
    label: 'Voltar',
    connectorId: 'app',
    connectorDisplayName: 'Aplicativo',
    defaultAccelerator: 'Ctrl+Alt+H',
  })
  kernel.registerCommand({
    id: 'navigation:forward',
    label: 'Avançar',
    connectorId: 'app',
    connectorDisplayName: 'Aplicativo',
  })
}
