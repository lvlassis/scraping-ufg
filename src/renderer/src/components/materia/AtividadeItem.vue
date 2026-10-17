<script setup lang="ts">
import { GraduationCap, BookOpen } from 'lucide-vue-next'
import type { Atividade } from '../../types/api'
import { urgencia, labelRelativo, isProva } from '../../lib/urgencia'

defineProps<{ atividade: Atividade }>()

const urgenciaClasses: Record<string, string> = {
  critica: 'border-destructive/40 bg-destructive/5',
  alta:    'border-orange-500/40 bg-orange-500/5',
  media:   'border-border bg-background',
  passada: 'border-border bg-muted opacity-50',
  'sem-data': 'border-border bg-background',
}

const badgeClasses: Record<string, string> = {
  critica:    'bg-destructive text-destructive-foreground',
  alta:       'bg-orange-500 text-white',
  media:      'bg-primary/10 text-primary',
  passada:    'bg-muted text-muted-foreground',
  'sem-data': 'bg-muted text-muted-foreground',
}
</script>

<template>
  <div
    class="flex items-center gap-3 px-3 py-2.5 rounded-md border transition-colors"
    :class="urgenciaClasses[urgencia(atividade.due)]"
  >
    <GraduationCap v-if="isProva(atividade.tipo)" :size="14" class="text-primary shrink-0" />
    <BookOpen v-else :size="14" class="text-muted-foreground shrink-0" />

    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-foreground truncate">{{ atividade.nome }}</p>
      <p class="text-xs text-muted-foreground capitalize">{{ atividade.tipo }}</p>
    </div>

    <span
      class="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
      :class="badgeClasses[urgencia(atividade.due)]"
    >
      {{ labelRelativo(atividade.due) }}
    </span>
  </div>
</template>
