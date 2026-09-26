<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { Materia } from '../../types/api'

defineProps<{ materia: Materia }>()
const emit = defineEmits<{ select: [materia: Materia] }>()

function diasDaSemana(horario: string): string {
  return horario.split(' ')[0]
}

function horaDaSemana(horario: string): string {
  return horario.split(' ').slice(1).join(' ')
}
</script>

<template>
  <button
    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-border hover:bg-secondary transition-colors cursor-pointer text-left"
    @click="emit('select', materia)"
  >
    <div class="w-1 h-8 rounded-full bg-primary shrink-0" />
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-foreground truncate">{{ materia.nome }}</p>
      <p class="text-xs text-muted-foreground">{{ materia.local }}</p>
    </div>
    <div class="text-right shrink-0 ml-4">
      <p class="text-xs font-medium text-foreground">{{ diasDaSemana(materia.horario) }}</p>
      <p class="text-xs text-muted-foreground">{{ horaDaSemana(materia.horario) }}</p>
    </div>
    <ChevronRight :size="14" class="text-muted-foreground shrink-0" />
  </button>
</template>
