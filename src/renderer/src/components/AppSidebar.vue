<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LayoutDashboard, BookOpen, ClipboardList, GraduationCap, Settings, LogOut, RefreshCw, Plus } from 'lucide-vue-next'
import type { Workspace, ConnectorStatus } from '../types/api'

const props = defineProps<{ workspace: Workspace }>()
const emit = defineEmits<{ close: []; 'add-plugin': []; 'open-settings': []; refreshed: [] }>()

const refreshing = ref(false)
const plugins = ref<ConnectorStatus[]>([])

onMounted(async () => {
  plugins.value = await window.api.getPlugins()
})

async function handleRefresh(): Promise<void> {
  refreshing.value = true
  try {
    await window.api.refreshAll()
    plugins.value = await window.api.getPlugins()
    emit('refreshed')
  } finally {
    refreshing.value = false
  }
}

const navItems = [
  { icon: LayoutDashboard, label: 'Início', active: true, action: null },
  { icon: BookOpen, label: 'Matérias', active: false, action: null },
  { icon: ClipboardList, label: 'Atividades', active: false, action: null },
  { icon: GraduationCap, label: 'Histórico', active: false, action: null },
  { icon: Settings, label: 'Configurações', active: false, action: 'settings' },
]

function pluginInitials(p: ConnectorStatus): string {
  return (p.displayName ?? p.connectorDisplayName).slice(0, 2).toUpperCase()
}
</script>

<template>
  <aside class="w-56 shrink-0 bg-background border-r border-border flex flex-col">
    <div class="px-5 py-4 border-b border-border flex items-center justify-between">
      <div class="min-w-0">
        <p class="font-semibold text-primary text-sm tracking-tight truncate">{{ workspace.name }}</p>
        <p class="text-xs text-muted-foreground">Academia</p>
      </div>
      <button
        @click="handleRefresh"
        :disabled="refreshing"
        class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title="Atualizar dados"
      >
        <RefreshCw :size="15" :class="{ 'animate-spin': refreshing }" />
      </button>
    </div>

    <nav class="flex-1 p-3 space-y-0.5">
      <button
        v-for="item in navItems"
        :key="item.label"
        @click="item.action === 'settings' ? emit('open-settings') : undefined"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer"
        :class="item.active
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'"
      >
        <component :is="item.icon" :size="15" class="shrink-0" />
        {{ item.label }}
      </button>
    </nav>

    <!-- Connected plugins -->
    <div class="px-4 py-3 border-t border-border space-y-1.5">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Conectores</p>
        <button
          @click="emit('add-plugin')"
          class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Adicionar conector"
        >
          <Plus :size="14" />
        </button>
      </div>
      <div v-if="plugins.length === 0" class="text-xs text-muted-foreground py-1">
        Nenhum conector
      </div>
      <div
        v-for="p in plugins"
        :key="p.connectorId"
        class="flex items-center gap-2"
      >
        <div class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <span class="text-[9px] font-bold text-primary">{{ pluginInitials(p) }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium text-foreground truncate">{{ p.displayName ?? p.connectorDisplayName }}</p>
          <p class="text-[10px] text-muted-foreground">{{ p.connectorDisplayName }}</p>
        </div>
      </div>
    </div>

    <div class="p-4 border-t border-border flex items-center justify-between">
      <p class="text-xs text-muted-foreground truncate">{{ workspace.name }}</p>
      <button
        @click="$emit('close')"
        class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        title="Fechar workspace"
      >
        <LogOut :size="15" />
      </button>
    </div>
  </aside>
</template>
