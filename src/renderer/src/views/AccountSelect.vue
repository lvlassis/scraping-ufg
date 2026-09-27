<script setup lang="ts">
import { ref } from 'vue'
import { Plus, MoreVertical, Trash2 } from 'lucide-vue-next'
import UserAvatar from '../components/UserAvatar.vue'
import type { Account } from '../types/api'

defineProps<{ accounts: Account[] }>()

const emit = defineEmits<{
  selected: [account: Account]
  'add-account': []
  'remove-account': [matricula: string]
}>()

const openMenuFor = ref<string | null>(null)

async function handleSelect(account: Account): Promise<void> {
  await window.api.selectAccount(account.matricula)
  emit('selected', account)
}

async function handleRemove(matricula: string): Promise<void> {
  openMenuFor.value = null
  await window.api.removeAccount(matricula)
  emit('remove-account', matricula)
}
</script>

<template>
  <div class="w-full max-w-sm space-y-6">
    <div class="text-center space-y-1">
      <p class="text-xl font-semibold text-foreground">SIGAA Desktop</p>
      <p class="text-sm text-muted-foreground">Escolha uma conta</p>
    </div>

    <div class="space-y-2">
      <div
        v-for="account in accounts"
        :key="account.matricula"
        class="relative"
      >
        <!-- overlay fecha o menu ao clicar fora -->
        <div
          v-if="openMenuFor === account.matricula"
          class="fixed inset-0 z-10"
          @click="openMenuFor = null"
        />

        <div
          @click="handleSelect(account)"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-secondary transition-colors cursor-pointer"
        >
          <UserAvatar :nome="account.nome" size="md" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-foreground truncate">{{ account.nome }}</p>
            <p class="text-xs text-muted-foreground">{{ account.matricula }}</p>
          </div>
          <button
            @click.stop="openMenuFor = openMenuFor === account.matricula ? null : account.matricula"
            class="relative z-20 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <MoreVertical :size="15" />
          </button>
        </div>

        <div
          v-if="openMenuFor === account.matricula"
          class="absolute right-0 top-full mt-1 z-20 bg-background border border-border rounded-md shadow-lg py-1 w-40"
        >
          <button
            @click="handleRemove(account.matricula)"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-secondary transition-colors cursor-pointer"
          >
            <Trash2 :size="13" />
            Remover conta
          </button>
        </div>
      </div>

      <button
        @click="emit('add-account')"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-border hover:bg-secondary transition-colors text-muted-foreground cursor-pointer"
      >
        <div class="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Plus :size="16" />
        </div>
        <span class="text-sm">Adicionar conta</span>
      </button>
    </div>
  </div>
</template>
