<script setup lang="ts">
import { CalendarClock } from 'lucide-vue-next'
import AtividadeItem from './AtividadeItem.vue'
import type { Atividade } from '../../types/api'

defineProps<{ atividades: Atividade[] }>()
</script>

<template>
  <div class="bg-background rounded-md border border-border shadow-md overflow-hidden">
    <div class="h-1 bg-primary" />
    <div class="p-5">
      <div class="flex items-center gap-2 mb-4">
        <CalendarClock :size="15" class="text-primary shrink-0" />
        <h2 class="font-semibold text-sm text-foreground">Atividades Pendentes</h2>
        <span class="ml-auto text-xs text-muted-foreground">{{ atividades.length }} atividade(s)</span>
      </div>

      <div v-if="atividades.length === 0" class="py-8 text-center text-sm text-muted-foreground">
        Nenhuma atividade registrada. Atualize os dados no painel principal.
      </div>

      <div v-else class="space-y-2">
        <AtividadeItem v-for="a in atividades" :key="a.id" :atividade="a" />
      </div>
    </div>
  </div>
</template>
