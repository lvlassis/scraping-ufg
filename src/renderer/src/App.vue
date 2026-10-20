<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNavigation } from './composables/useNavigation'
import AppSidebar from './components/AppSidebar.vue'
import Dashboard from './views/Dashboard.vue'
import WorkspaceCreate from './views/WorkspaceCreate.vue'
import WorkspaceSelect from './views/WorkspaceSelect.vue'
import SettingsModal from './components/settings/SettingsModal.vue'
import type { Workspace, ConnectorInfo, ConnectorStatus } from './types/api'

type AppState = 'loading' | 'create-workspace' | 'select-workspace' | 'dashboard'

const state = ref<AppState>('loading')
const workspaces = ref<Workspace[]>([])
const currentWorkspace = ref<Workspace | null>(null)
const showAddPluginModal = ref(false)
const connectors = ref<ConnectorInfo[]>([])
const addPluginLoading = ref<string | null>(null)
const addPluginError = ref('')
const dashboardKey = ref(0)
const toastMessage = ref('')
const showCloseDialog = ref(false)
const showSettings = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null
const shortcutMap = ref(new Map<string, string>()) // accelerator → commandId
const nav = useNavigation()
const rendererCommands = new Map<string, () => void>([
  ['navigation:back', () => nav.back()],
  ['navigation:forward', () => nav.forward()],
])

async function loadShortcuts(): Promise<void> {
  const list = await window.api.getShortcuts()
  shortcutMap.value = new Map(list.map((s) => [s.accelerator, s.commandId]))
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

async function onGlobalKeydown(e: KeyboardEvent): Promise<void> {
  if (e.key === 'Escape') {
    if (showSettings.value)        { showSettings.value = false; dashboardKey.value++; loadShortcuts(); return }
    if (showAddPluginModal.value)  { showAddPluginModal.value = false; return }
    if (showCloseDialog.value)     { showCloseDialog.value = false; return }
  }

  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
  const accelerator = buildAccelerator(e)
  if (!accelerator) return
  const commandId = shortcutMap.value.get(accelerator)
  if (!commandId) return
  e.preventDefault()

  const rendererHandler = rendererCommands.get(commandId)
  if (rendererHandler) {
    rendererHandler()
    return
  }

  try {
    await window.api.executeCommand(commandId)
    onRefreshed()
  } catch {
    // command failed silently
  }
}

function showToast(message: string): void {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = message
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 3000)
}

function onRefreshed(): void {
  dashboardKey.value++
  showToast('Atualizado!')
}

onMounted(async () => {
  window.addEventListener('keydown', onGlobalKeydown)

  workspaces.value = await window.api.getWorkspaces()
  if (workspaces.value.length === 0) {
    state.value = 'create-workspace'
  } else if (workspaces.value.length === 1) {
    await window.api.openWorkspace(workspaces.value[0].id)
    currentWorkspace.value = workspaces.value[0]
    state.value = 'dashboard'
    await loadShortcuts()
  } else {
    state.value = 'select-workspace'
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})

async function onWorkspaceCreated(ws: Workspace): Promise<void> {
  workspaces.value.push(ws)
  currentWorkspace.value = ws
  state.value = 'dashboard'
  await loadShortcuts()
}

async function onWorkspaceSelected(ws: Workspace): Promise<void> {
  currentWorkspace.value = ws
  state.value = 'dashboard'
  await loadShortcuts()
}

function onWorkspaceRemoved(id: string): void {
  workspaces.value = workspaces.value.filter((w) => w.id !== id)
  if (workspaces.value.length === 0) state.value = 'create-workspace'
}

async function openAddPlugin(): Promise<void> {
  addPluginError.value = ''
  addPluginLoading.value = null
  connectors.value = await window.api.getConnectors()
  showAddPluginModal.value = true
}

async function handleAddPlugin(connectorId: string): Promise<void> {
  addPluginLoading.value = connectorId
  addPluginError.value = ''
  try {
    await window.api.addPlugin(connectorId)
    showAddPluginModal.value = false
    dashboardKey.value++
    showToast('Conector adicionado!')
  } catch (e) {
    addPluginError.value = e instanceof Error ? e.message : 'Erro ao conectar'
  } finally {
    addPluginLoading.value = null
  }
}

async function closeWorkspace(): Promise<void> {
  showCloseDialog.value = false
  await window.api.closeWorkspace()
  currentWorkspace.value = null
  if (workspaces.value.length <= 1) {
    state.value = 'create-workspace'
  } else {
    state.value = 'select-workspace'
  }
}
</script>

<template>
  <div
    v-if="state !== 'dashboard'"
    class="h-screen flex items-center justify-center bg-muted"
  >
    <WorkspaceCreate
      v-if="state === 'create-workspace'"
      @created="onWorkspaceCreated"
    />
    <WorkspaceSelect
      v-else-if="state === 'select-workspace'"
      :workspaces="workspaces"
      @selected="onWorkspaceSelected"
      @create-new="state = 'create-workspace'"
      @removed="onWorkspaceRemoved"
    />
  </div>

  <div v-else class="h-screen flex overflow-hidden bg-muted">
    <AppSidebar
      :workspace="currentWorkspace!"
      @close="showCloseDialog = true"
      @add-plugin="openAddPlugin"
      @open-settings="showSettings = true"
      @refreshed="onRefreshed"
    />
    <main class="flex-1 overflow-y-auto">
      <Dashboard :key="dashboardKey" :workspace="currentWorkspace!" @add-plugin="openAddPlugin" />
    </main>

    <!-- Settings Modal -->
    <Transition name="fade">
      <SettingsModal
        v-if="showSettings"
        @close="showSettings = false; dashboardKey++; loadShortcuts()"
      />
    </Transition>

    <!-- Add Plugin Modal -->
    <Transition name="fade">
      <div
        v-if="showAddPluginModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showAddPluginModal = false"
      >
        <div class="bg-background rounded-lg border border-border p-6 w-80 shadow-xl space-y-4">
          <h2 class="text-sm font-semibold text-foreground">Adicionar conector</h2>
          <p class="text-xs text-muted-foreground">Escolha uma plataforma para conectar ao workspace.</p>
          <div class="space-y-2">
            <button
              v-for="c in connectors"
              :key="c.id"
              @click="handleAddPlugin(c.id)"
              :disabled="addPluginLoading !== null"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {{ addPluginLoading === c.id ? 'Aguardando login...' : `Entrar com ${c.displayName}` }}
            </button>
          </div>
          <p v-if="addPluginError" class="text-xs text-destructive text-center">{{ addPluginError }}</p>
          <button
            @click="showAddPluginModal = false"
            class="w-full py-2 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Transition>

    <!-- Close Workspace Dialog -->
    <Transition name="fade">
      <div
        v-if="showCloseDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showCloseDialog = false"
      >
        <div class="bg-background rounded-lg border border-border p-6 w-80 shadow-xl">
          <h2 class="text-sm font-semibold text-foreground mb-1">Fechar workspace</h2>
          <p class="text-xs text-muted-foreground mb-5">{{ currentWorkspace?.name }}</p>
          <div class="flex flex-col gap-2">
            <button
              @click="closeWorkspace"
              class="w-full px-3 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              @click="showCloseDialog = false"
              class="w-full px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div
        v-if="toastMessage"
        class="toast fixed z-50 bg-background border border-border rounded-lg shadow-lg px-4 py-2.5 flex items-center gap-2"
      >
        <span class="text-xs font-medium text-foreground">{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, top 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  top: 0;
}
</style>
