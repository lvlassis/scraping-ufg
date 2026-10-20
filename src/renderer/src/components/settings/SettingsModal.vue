<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X, Layers, Keyboard } from 'lucide-vue-next'
import PluginSigaaSettings from './PluginSigaaSettings.vue'
import PluginStubSettings from './PluginStubSettings.vue'
import ShortcutsSettings from './ShortcutsSettings.vue'
import type { ConnectorInfo, ConnectorStatus } from '../../types/api'

const emit = defineEmits<{ close: [] }>()

type Section = 'shortcuts' | string  // string = connectorId

const selectedSection = ref<Section>('shortcuts')
const connectors = ref<ConnectorInfo[]>([])
const plugins = ref<ConnectorStatus[]>([])
const loading = ref(true)

onMounted(async () => {
  ;[connectors.value, plugins.value] = await Promise.all([
    window.api.getConnectors(),
    window.api.getPlugins(),
  ])
  loading.value = false
})

function getPlugin(connectorId: string): ConnectorStatus | null {
  return plugins.value.find((p) => p.connectorId === connectorId) ?? null
}

function isConfigured(connectorId: string): boolean {
  return plugins.value.some((p) => p.connectorId === connectorId)
}

function selectedConnector(): ConnectorInfo | undefined {
  return connectors.value.find((c) => c.id === selectedSection.value)
}

async function onConnected(): Promise<void> {
  plugins.value = await window.api.getPlugins()
}

async function onDisconnected(): Promise<void> {
  plugins.value = await window.api.getPlugins()
}

async function onToggled(): Promise<void> {
  plugins.value = await window.api.getPlugins()
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
    @click.self="emit('close')"
  >
    <div class="bg-background w-[1080px] h-[720px] rounded-xl shadow-2xl flex overflow-hidden border border-border">

      <!-- Left Sidebar -->
      <div class="w-56 bg-muted/40 border-r border-border flex flex-col shrink-0">
        <div class="px-5 py-5 pb-3">
          <p class="text-sm font-semibold text-foreground">Configurações</p>
        </div>

        <nav class="flex-1 px-2 pb-4 overflow-y-auto">
          <!-- Geral section -->
          <div class="px-3 pt-3 pb-1.5">
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Geral</p>
          </div>

          <button
            @click="selectedSection = 'shortcuts'"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer text-left"
            :class="selectedSection === 'shortcuts'
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'"
          >
            <Keyboard :size="14" class="shrink-0" />
            Atalhos
          </button>

          <!-- Plugins section -->
          <div class="px-3 pt-4 pb-1.5">
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Plugins</p>
          </div>

          <button
            v-for="c in connectors"
            :key="c.id"
            @click="selectedSection = c.id"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer text-left"
            :class="selectedSection === c.id
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'"
          >
            <div
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="isConfigured(c.id) ? 'bg-green-500' : 'bg-muted-foreground/50'"
            />
            {{ c.displayName }}
          </button>
        </nav>
      </div>

      <!-- Right Content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top bar -->
        <div class="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
          <div class="flex items-center gap-2 text-muted-foreground">
            <Keyboard v-if="selectedSection === 'shortcuts'" :size="14" />
            <Layers v-else :size="14" />
            <span class="text-xs">{{ selectedSection === 'shortcuts' ? 'Atalhos' : 'Plugins' }}</span>
          </div>
          <button
            @click="emit('close')"
            class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-md p-1 hover:bg-secondary"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Content area -->
        <div class="flex-1 overflow-y-auto px-8 py-6">
          <div v-if="loading" class="flex items-center justify-center h-32">
            <p class="text-sm text-muted-foreground">Carregando...</p>
          </div>

          <ShortcutsSettings v-else-if="selectedSection === 'shortcuts'" />

          <template v-else-if="selectedConnector()">
            <PluginSigaaSettings
              v-if="selectedSection === 'sigaa-ufg'"
              :plugin="getPlugin('sigaa-ufg')"
              @connected="onConnected"
              @disconnected="onDisconnected"
              @toggled="onToggled"
            />
            <PluginStubSettings
              v-else
              :connector="selectedConnector()!"
            />
          </template>
        </div>
      </div>

    </div>
  </div>
</template>
