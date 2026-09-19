<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LayoutDashboard, BookOpen, ClipboardList, GraduationCap, Settings } from 'lucide-vue-next'
import Dashboard from './views/Dashboard.vue'
import Login from './views/Login.vue'
import AccountSelect from './views/AccountSelect.vue'
import type { Account } from './types/api'

type AppState = 'loading' | 'login' | 'select-account' | 'dashboard'

const state = ref<AppState>('loading')
const accounts = ref<Account[]>([])
const currentUser = ref<Account | null>(null)

const navItems = [
  { icon: LayoutDashboard, label: 'Início', active: true },
  { icon: BookOpen, label: 'Matérias', active: false },
  { icon: ClipboardList, label: 'Atividades', active: false },
  { icon: GraduationCap, label: 'Histórico', active: false },
  { icon: Settings, label: 'Configurações', active: false },
]

onMounted(async () => {
  accounts.value = await window.api.getAccounts()
  state.value = accounts.value.length === 0 ? 'login' : 'select-account'
})

function onLoggedIn(account: Account): void {
  currentUser.value = account
  if (!accounts.value.find((a) => a.matricula === account.matricula)) {
    accounts.value.push(account)
  }
  state.value = 'dashboard'
}

function onAccountSelected(account: Account): void {
  currentUser.value = account
  state.value = 'dashboard'
}
</script>

<template>
  <!-- Telas de autenticação -->
  <div
    v-if="state === 'loading' || state === 'login' || state === 'select-account'"
    class="h-screen flex items-center justify-center bg-muted"
  >
    <Login v-if="state === 'login'" @logged-in="onLoggedIn" />
    <AccountSelect
      v-else-if="state === 'select-account'"
      :accounts="accounts"
      @selected="onAccountSelected"
      @add-account="state = 'login'"
    />
  </div>

  <!-- App principal -->
  <div v-else class="h-screen flex overflow-hidden bg-muted">
    <aside class="w-56 shrink-0 bg-background border-r border-border flex flex-col">
      <div class="px-5 py-4 border-b border-border">
        <p class="font-semibold text-primary text-sm tracking-tight">SIGAA Desktop</p>
        <p class="text-xs text-muted-foreground">UFG</p>
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

      <div class="p-4 border-t border-border">
        <p class="text-xs text-muted-foreground truncate">{{ currentUser?.nome }}</p>
        <p class="text-xs text-muted-foreground">{{ currentUser?.matricula }}</p>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <Dashboard :user="currentUser!" />
    </main>
  </div>
</template>
