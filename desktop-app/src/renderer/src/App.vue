<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import Dashboard from './views/Dashboard.vue'
import Login from './views/Login.vue'
import AccountSelect from './views/AccountSelect.vue'
import type { Account } from './types/api'

type AppState = 'loading' | 'login' | 'select-account' | 'dashboard'

const state = ref<AppState>('loading')
const accounts = ref<Account[]>([])
const currentUser = ref<Account | null>(null)

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
  <div
    v-if="state !== 'dashboard'"
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

  <div v-else class="h-screen flex overflow-hidden bg-muted">
    <AppSidebar :user="currentUser!" />
    <main class="flex-1 overflow-y-auto">
      <Dashboard :user="currentUser!" />
    </main>
  </div>
</template>
