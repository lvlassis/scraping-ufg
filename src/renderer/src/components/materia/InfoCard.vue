<script setup lang="ts">
import { MapPin, Clock } from 'lucide-vue-next'
import type { Materia } from '../../types/api'

defineProps<{ materia: Materia }>()

function diasDaSemana(horario: string): string {
  return horario.split(' ')[0]
}

function horaDaSemana(horario: string): string {
  return horario.split(' ').slice(1).join(' ')
}
</script>

<template>
  <div class="bg-background rounded-md border border-border shadow-md overflow-hidden">
    <div class="h-1 bg-primary" />
    <div class="p-5">
      <h2 class="font-semibold text-sm text-foreground mb-4">Informações</h2>

      <div class="space-y-3">
        <div class="flex items-start gap-2.5">
          <MapPin :size="14" class="text-primary mt-0.5 shrink-0" />
          <div>
            <p class="text-xs text-muted-foreground">Sala</p>
            <p class="text-sm text-foreground">{{ materia.local || '—' }}</p>
          </div>
        </div>

        <div class="flex items-start gap-2.5">
          <Clock :size="14" class="text-primary mt-0.5 shrink-0" />
          <div>
            <p class="text-xs text-muted-foreground">Horário</p>
            <p class="text-sm text-foreground">{{ diasDaSemana(materia.horario) }}</p>
            <p class="text-xs text-muted-foreground">{{ horaDaSemana(materia.horario) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
