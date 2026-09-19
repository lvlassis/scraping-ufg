<script setup lang="ts">
import { ref } from 'vue'
import { LogIn } from 'lucide-vue-next'
import type { Account } from '../types/api'

const emit = defineEmits<{
  'logged-in': [account: Account]
}>()

const loading = ref(false)
const error = ref('')

async function handleLogin(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const account = await window.api.openSigaaLogin()
    emit('logged-in', account)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro desconhecido'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm space-y-6">
    <div class="text-center space-y-1">
      <p class="text-2xl font-semibold text-foreground">SIGAA Desktop</p>
      <p class="text-sm text-muted-foreground">UFG</p>
    </div>

    <div class="bg-background rounded-lg border border-border p-6 space-y-4">
      <p class="text-sm text-muted-foreground text-center">
        Clique abaixo para abrir o SIGAA e fazer login normalmente. Os dados de sessão serão capturados automaticamente.
      </p>

      <button
        @click="handleLogin"
        :disabled="loading"
        class="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        <LogIn :size="15" />
        {{ loading ? 'Aguardando login...' : 'Entrar com SIGAA' }}
      </button>

      <p v-if="error" class="text-xs text-destructive text-center">{{ error }}</p>
    </div>
  </div>
</template>
