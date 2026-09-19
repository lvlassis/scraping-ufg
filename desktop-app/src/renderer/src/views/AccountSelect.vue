<script setup lang="ts">
import { UserRound, Plus } from 'lucide-vue-next'
import type { Account } from '../types/api'

defineProps<{ accounts: Account[] }>()

const emit = defineEmits<{
  selected: [account: Account]
  'add-account': []
}>()

async function handleSelect(account: Account): Promise<void> {
  await window.api.selectAccount(account.matricula)
  emit('selected', account)
}
</script>

<template>
  <div class="w-full max-w-sm space-y-6">
    <div class="text-center space-y-1">
      <p class="text-xl font-semibold text-foreground">SIGAA Desktop</p>
      <p class="text-sm text-muted-foreground">Escolha uma conta</p>
    </div>

    <div class="space-y-2">
      <button
        v-for="account in accounts"
        :key="account.matricula"
        @click="handleSelect(account)"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-left"
      >
        <div class="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
          <UserRound :size="16" class="text-accent-foreground" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-foreground truncate">{{ account.nome }}</p>
          <p class="text-xs text-muted-foreground">{{ account.matricula }}</p>
        </div>
      </button>

      <button
        @click="emit('add-account')"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-border hover:bg-secondary transition-colors text-muted-foreground"
      >
        <div class="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Plus :size="16" />
        </div>
        <span class="text-sm">Adicionar conta</span>
      </button>
    </div>
  </div>
</template>
