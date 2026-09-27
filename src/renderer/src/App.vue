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
const showLogoutDialog = ref(false)
const removeData = ref(false)

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

function onAccountRemoved(matricula: string): void {
  accounts.value = accounts.value.filter((a) => a.matricula !== matricula)
  if (accounts.value.length === 0) state.value = 'login'
}

function afterLogout(): void {
  showLogoutDialog.value = false
  removeData.value = false
  currentUser.value = null
  state.value = accounts.value.length === 0 ? 'login' : 'select-account'
}

async function logout(): Promise<void> {
  await window.api.logout()
  afterLogout()
}

async function logoutAndRemove(): Promise<void> {
  const matricula = currentUser.value!.matricula
  await window.api.removeAccount(matricula)
  accounts.value = accounts.value.filter((a) => a.matricula !== matricula)
  afterLogout()
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
      @remove-account="onAccountRemoved"
    />
  </div>

  <div v-else class="h-screen flex overflow-hidden bg-muted">
    <AppSidebar :user="currentUser!" @logout="showLogoutDialog = true" />
    <main class="flex-1 overflow-y-auto">
      <Dashboard :user="currentUser!" />
    </main>

    <Transition name="fade">
      <div
        v-if="showLogoutDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showLogoutDialog = false; removeData = false"
      >
        <div class="bg-background rounded-lg border border-border p-6 w-80 shadow-xl">
          <h2 class="text-sm font-semibold text-foreground mb-1">Sair da conta</h2>
          <p class="text-xs text-muted-foreground mb-5">{{ currentUser?.nome }}</p>
          <div class="flex flex-col gap-2">
            <button
              @click="removeData ? logoutAndRemove() : logout()"
              class="w-full px-3 py-2 rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer"
            >
              Sair
            </button>
            <button
              @click="showLogoutDialog = false; removeData = false"
              class="w-full px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <label class="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input v-model="removeData" type="checkbox" class="accent-destructive cursor-pointer" />
              <span class="text-xs text-muted-foreground">Apagar dados salvos da conta</span>
            </label>
          </div>
        </div>
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
</style>
