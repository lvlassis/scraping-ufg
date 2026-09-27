<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ updated: [] }>()

const cookies = ref('')
const loading = ref(false)
const error = ref('')

async function handleUpdate(): Promise<void> {
  if (!cookies.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    await window.api.updateMaterias(cookies.value.trim())
    cookies.value = ''
    emit('updated')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro desconhecido'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-4 rounded-md border border-border bg-background space-y-2">
    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Atualizar dados (temporário)</p>
    <div class="flex gap-2">
      <input
        v-model="cookies"
        type="text"
        placeholder="Cole os cookies SIGAA aqui..."
        class="flex-1 text-sm px-3 py-1.5 rounded-md border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        @click="handleUpdate"
        :disabled="loading || !cookies.trim()"
        class="text-sm px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {{ loading ? 'Atualizando...' : 'Atualizar' }}
      </button>
    </div>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
