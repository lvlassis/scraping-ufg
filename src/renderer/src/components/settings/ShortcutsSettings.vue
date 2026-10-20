<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Keyboard, X } from 'lucide-vue-next'
import type { CommandInfo, WorkspaceShortcut } from '../../types/api'

const commands = ref<CommandInfo[]>([])
const shortcuts = ref<WorkspaceShortcut[]>([])
const capturing = ref<string | null>(null) // commandId being captured

onMounted(async () => {
  ;[commands.value, shortcuts.value] = await Promise.all([
    window.api.getCommands(),
    window.api.getShortcuts(),
  ])
})

function getShortcut(commandId: string): string | null {
  return shortcuts.value.find((s) => s.commandId === commandId)?.accelerator ?? null
}


function startCapture(commandId: string): void {
  capturing.value = commandId
  window.addEventListener('keydown', onCaptureKeydown, { once: true })
}

function cancelCapture(): void {
  capturing.value = null
  window.removeEventListener('keydown', onCaptureKeydown)
}

function buildAccelerator(e: KeyboardEvent): string | null {
  const modifiers = ['Control', 'Alt', 'Shift', 'Meta']
  if (modifiers.includes(e.key)) return null
  const parts: string[] = []
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key
  parts.push(key)
  return parts.join('+')
}

async function onCaptureKeydown(e: KeyboardEvent): Promise<void> {
  e.preventDefault()
  e.stopImmediatePropagation()

  const commandId = capturing.value
  if (!commandId) return

  if (e.key === 'Escape') {
    capturing.value = null
    return
  }

  const accelerator = buildAccelerator(e)
  if (!accelerator) {
    window.addEventListener('keydown', onCaptureKeydown, { once: true })
    return
  }

  capturing.value = null
  await window.api.setShortcut(commandId, accelerator)
  shortcuts.value = await window.api.getShortcuts()
}

async function handleRemove(commandId: string): Promise<void> {
  await window.api.removeShortcut(commandId)
  shortcuts.value = await window.api.getShortcuts()
}

const connectorGroups = computed(() => {
  const groups = new Map<string, { displayName: string; commands: CommandInfo[] }>()
  for (const cmd of commands.value) {
    if (!groups.has(cmd.connectorId)) {
      groups.set(cmd.connectorId, { displayName: cmd.connectorDisplayName, commands: [] })
    }
    groups.get(cmd.connectorId)!.commands.push(cmd)
  }
  return groups
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-lg font-semibold text-foreground">Atalhos de Teclado</h2>
      <p class="text-sm text-muted-foreground mt-1">
        Configure atalhos de teclado para os comandos disponíveis.
      </p>
    </div>

    <div v-if="commands.length === 0" class="text-sm text-muted-foreground">
      Nenhum comando disponível. Adicione um conector para ver comandos.
    </div>

    <template v-for="[connectorId, group] in connectorGroups" :key="connectorId">
      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {{ group.displayName }}
        </h3>

        <div class="rounded-lg border border-border divide-y divide-border">
          <div
            v-for="cmd in group.commands"
            :key="cmd.id"
            class="flex items-center justify-between px-4 py-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <Keyboard :size="14" class="text-muted-foreground shrink-0" />
              <span class="text-sm text-foreground truncate">{{ cmd.label }}</span>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-4">
              <button
                v-if="capturing === cmd.id"
                @click="cancelCapture"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary text-xs font-medium text-primary animate-pulse cursor-pointer"
              >
                Pressione uma tecla... (Esc para cancelar)
              </button>

              <template v-else>
                <kbd
                  v-if="getShortcut(cmd.id)"
                  class="px-2 py-1 rounded bg-muted border border-border text-xs font-mono text-foreground"
                >
                  {{ getShortcut(cmd.id) }}
                </kbd>
                <span v-else class="text-xs text-muted-foreground">—</span>

                <button
                  @click="startCapture(cmd.id)"
                  class="px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  {{ getShortcut(cmd.id) ? 'Alterar' : 'Definir' }}
                </button>

                <button
                  v-if="getShortcut(cmd.id)"
                  @click="handleRemove(cmd.id)"
                  class="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Remover atalho"
                >
                  <X :size="12" />
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
