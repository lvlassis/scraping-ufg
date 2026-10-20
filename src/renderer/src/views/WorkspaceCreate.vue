<script setup lang="ts">
import { ref } from 'vue'
import { FolderOpen } from 'lucide-vue-next'
import type { Workspace } from '../types/api'

const emit = defineEmits<{
  created: [workspace: Workspace]
}>()

const workspaceName = ref('')
const loading = ref(false)
const error = ref('')

async function handleCreate(): Promise<void> {
  const name = workspaceName.value.trim()
  if (!name) return
  loading.value = true
  error.value = ''
  try {
    const ws = await window.api.createWorkspace(name)
    emit('created', ws)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro ao criar workspace'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm space-y-6">
    <div class="text-center space-y-1">
      <p class="text-2xl font-semibold text-foreground">Academia</p>
      <p class="text-sm text-muted-foreground">Crie seu workspace acadêmico</p>
    </div>

    <div class="bg-background rounded-lg border border-border p-6 space-y-4">
      <div class="flex items-center gap-3 text-muted-foreground mb-2">
        <FolderOpen :size="18" />
        <p class="text-sm">Um workspace reúne todos os seus conectores em um só lugar.</p>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-medium text-foreground">Nome do workspace</label>
        <input
          v-model="workspaceName"
          type="text"
          placeholder="Ex: UFG - Ciência da Computação"
          @keydown.enter="handleCreate"
          class="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        @click="handleCreate"
        :disabled="loading || !workspaceName.trim()"
        class="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {{ loading ? 'Criando...' : 'Criar Workspace' }}
      </button>

      <p v-if="error" class="text-xs text-destructive text-center">{{ error }}</p>
    </div>
  </div>
</template>
