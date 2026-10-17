<script setup lang="ts">
import { ref } from 'vue'
import { LayoutDashboard, BookOpen, ClipboardList, GraduationCap, Settings, LogOut, RefreshCw } from 'lucide-vue-next'
import UserAvatar from './UserAvatar.vue'
import type { Account } from '../types/api'

const props = defineProps<{ user: Account }>()
const emit = defineEmits<{ logout: []; refreshed: [] }>()

const refreshing = ref(false)

async function handleRefresh(): Promise<void> {
  refreshing.value = true
  try {
    await window.api.refresh(props.user.matricula)
    emit('refreshed')
  } finally {
    refreshing.value = false
  }
}

const navItems = [
  { icon: LayoutDashboard, label: 'Início', active: true },
  { icon: BookOpen, label: 'Matérias', active: false },
  { icon: ClipboardList, label: 'Atividades', active: false },
  { icon: GraduationCap, label: 'Histórico', active: false },
  { icon: Settings, label: 'Configurações', active: false },
]
</script>

<template>
  <aside class="w-56 shrink-0 bg-background border-r border-border flex flex-col">
    <div class="px-5 py-4 border-b border-border flex items-center justify-between">
      <div>
        <p class="font-semibold text-primary text-sm tracking-tight">SIGAA Desktop</p>
        <p class="text-xs text-muted-foreground">UFG</p>
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
        class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer"
        :class="item.active
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'"
      >
        <component :is="item.icon" :size="15" class="shrink-0" />
        {{ item.label }}
      </button>
    </nav>

    <div class="p-4 border-t border-border flex items-center gap-3">
      <UserAvatar :nome="user.nome" size="sm" />
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-foreground truncate">{{ user.nome }}</p>
        <p class="text-xs text-muted-foreground">{{ user.matricula }}</p>
      </div>
      <button
        @click="$emit('logout')"
        class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        title="Sair"
      >
        <LogOut :size="15" />
      </button>
    </div>
  </aside>
</template>
