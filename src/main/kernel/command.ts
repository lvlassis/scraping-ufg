import type { KernelAPI } from './types'

export interface CommandDefinition {
  id: string
  label: string
  defaultAccelerator?: string
  // Omit execute for renderer-only commands (kernel is a no-op; renderer handles them)
  execute?(workspaceId: string, kernel: KernelAPI): Promise<void>
}

// Serializable form sent to renderer (no execute function)
export interface CommandInfo {
  id: string
  label: string
  connectorId: string
  connectorDisplayName: string
}

// Internal form stored in Kernel's command registry
export type StoredCommand = CommandDefinition & {
  connectorId: string
  connectorDisplayName: string
}
