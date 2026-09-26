<script setup lang="ts">
import { AlertTriangle, BookOpen } from 'lucide-vue-next'
import type { Atividade } from '../../types/api'

defineProps<{ atividade: Atividade }>()

function formatDue(due: string | null): string {
  if (!due) return 'Sem data'
  return new Date(due).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isPast(due: string | null): boolean {
  return due != null && new Date(due) < new Date()
}
</script>

<template>
  <div
    class="flex items-start gap-3 px-3 py-2.5 rounded-md border border-border"
    :class="isPast(atividade.due) ? 'opacity-50' : ''"
  >
    <AlertTriangle
      v-if="atividade.tipo === 'alerta'"
      :size="14"
      class="text-yellow-500 mt-0.5 shrink-0"
    />
    <BookOpen v-else :size="14" class="text-primary mt-0.5 shrink-0" />
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-foreground truncate">{{ atividade.nome }}</p>
      <p class="text-xs text-muted-foreground">{{ formatDue(atividade.due) }}</p>
    </div>
  </div>
</template>
