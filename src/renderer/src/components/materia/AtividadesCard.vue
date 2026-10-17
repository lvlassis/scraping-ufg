<script setup lang="ts">
import { computed } from 'vue'
import { CalendarClock } from 'lucide-vue-next'
import AtividadeItem from './AtividadeItem.vue'
import type { Atividade } from '../../types/api'
import { diasRestantes } from '../../lib/urgencia'

const props = defineProps<{ atividades: Atividade[] }>()

const futuras = computed(() =>
  props.atividades
    .filter(a => (diasRestantes(a.due) ?? -1) >= 0)
    .sort((a, b) => {
      if (!a.due) return 1
      if (!b.due) return -1
      return new Date(a.due).getTime() - new Date(b.due).getTime()
    })
)

const passadas = computed(() =>
  props.atividades
    .filter(a => (diasRestantes(a.due) ?? 0) < 0)
    .sort((a, b) => new Date(b.due!).getTime() - new Date(a.due!).getTime())
)
</script>

<template>
  <div class="bg-background rounded-md border border-border shadow-sm overflow-hidden">
    <div class="h-1 bg-primary" />
    <div class="p-5">
      <div class="flex items-center gap-2 mb-4">
        <CalendarClock :size="15" class="text-primary shrink-0" />
        <h2 class="font-semibold text-sm text-foreground">Agenda</h2>
        <span class="ml-auto text-xs text-muted-foreground">{{ futuras.length }} pendente(s)</span>
      </div>

      <div v-if="atividades.length === 0" class="py-8 text-center text-sm text-muted-foreground">
        Nenhuma atividade registrada.
      </div>

      <div v-else class="space-y-2">
        <div v-if="futuras.length === 0" class="py-4 text-center text-sm text-muted-foreground">
          Nenhuma atividade pendente.
        </div>
        <AtividadeItem v-for="a in futuras" :key="a.id" :atividade="a" />

        <details v-if="passadas.length > 0" class="mt-3">
          <summary class="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
            {{ passadas.length }} encerrada(s)
          </summary>
          <div class="space-y-2 mt-2">
            <AtividadeItem v-for="a in passadas" :key="a.id" :atividade="a" />
          </div>
        </details>
      </div>
    </div>
  </div>
</template>
