<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, GraduationCap, ClipboardList, MapPin, Clock, CheckCircle2 } from 'lucide-vue-next'
import AtividadesCard from '../components/materia/AtividadesCard.vue'
import PlanoCard from '../components/materia/PlanoCard.vue'
import type { Materia, Atividade } from '../types/api'
import { urgencia, labelRelativo, diasRestantes, isProva } from '../lib/urgencia'

const props = defineProps<{ materia: Materia; semestre: string }>()
const emit = defineEmits<{ back: [] }>()

const atividades = ref<Atividade[]>([])

onMounted(async () => {
  atividades.value = await window.api.getAtividadesPorMateria(props.materia.nome, props.semestre)
})

const proximaProva = computed(() =>
  atividades.value
    .filter(a => isProva(a.tipo) && (diasRestantes(a.due) ?? -1) >= 0)
    .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())[0] ?? null
)

const atividadesPendentes = computed(() =>
  atividades.value.filter(a => !isProva(a.tipo) && (diasRestantes(a.due) ?? -1) >= 0)
)

const proximaAtividade = computed(() =>
  [...atividadesPendentes.value].sort((a, b) => {
    if (!a.due) return 1
    if (!b.due) return -1
    return new Date(a.due).getTime() - new Date(b.due).getTime()
  })[0] ?? null
)

const tudoEmDia = computed(() => !proximaProva.value && atividadesPendentes.value.length === 0)
const urgenciaProva = computed(() => urgencia(proximaProva.value?.due ?? null))

const provaCardClasses = computed(() => ({
  critica:    'border-destructive/50 bg-destructive/5',
  alta:       'border-orange-500/50 bg-orange-500/5',
  media:      'border-border bg-background',
  passada:    'border-border bg-background',
  'sem-data': 'border-border bg-background',
}[urgenciaProva.value]))

const provaAccentClasses = computed(() => ({
  critica:    'bg-destructive',
  alta:       'bg-orange-500',
  media:      'bg-primary',
  passada:    'bg-primary',
  'sem-data': 'bg-muted',
}[urgenciaProva.value]))

const provaBadgeClasses = computed(() => ({
  critica:    'bg-destructive text-destructive-foreground',
  alta:       'bg-orange-500 text-white',
  media:      'bg-primary/15 text-primary',
  passada:    'bg-muted text-muted-foreground',
  'sem-data': 'bg-muted text-muted-foreground',
}[urgenciaProva.value]))

function formatDate(due: string | null): string {
  if (!due) return ''
  return new Date(due).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div class="p-6 overflow-y-auto">
    <div class="max-w-2xl mx-auto space-y-5">

      <!-- Cabeçalho -->
      <div>
        <button
          class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
          @click="emit('back')"
        >
          <ArrowLeft :size="14" />
          Voltar
        </button>

        <h1 class="text-xl font-semibold text-foreground">{{ materia.nome }}</h1>

        <div class="flex items-center gap-3 mt-1.5 flex-wrap">
          <span class="text-xs text-muted-foreground">{{ semestre }}</span>
          <span class="w-px h-3 bg-border" />
          <span class="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin :size="11" />
            {{ materia.local || 'Sala não informada' }}
          </span>
          <span class="w-px h-3 bg-border" />
          <span class="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock :size="11" />
            {{ materia.horario }}
          </span>
        </div>
      </div>

      <!-- Camada 1: Tudo em dia -->
      <div
        v-if="tudoEmDia"
        class="rounded-xl border border-green-500/30 bg-green-500/5 flex flex-col items-center justify-center gap-3 py-14 text-center"
      >
        <CheckCircle2 :size="44" class="text-green-500" />
        <div>
          <p class="text-lg font-semibold text-foreground">Tudo em dia!</p>
          <p class="text-sm text-muted-foreground mt-0.5">Sem provas ou atividades pendentes.</p>
        </div>
      </div>

      <!-- Camada 1: Hero com conteúdo -->
      <div v-else class="grid grid-cols-2 gap-4">
        <!-- Próxima Prova -->
        <div class="rounded-lg border shadow-sm overflow-hidden" :class="provaCardClasses">
          <div class="h-1" :class="provaAccentClasses" />
          <div class="p-4 space-y-3">
            <div class="flex items-center gap-1.5">
              <GraduationCap :size="13" class="text-muted-foreground" />
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Próxima Prova</span>
            </div>
            <div v-if="proximaProva">
              <p class="text-sm font-semibold text-foreground leading-snug">{{ proximaProva.nome }}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-muted-foreground">{{ formatDate(proximaProva.due) }}</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="provaBadgeClasses">
                  {{ labelRelativo(proximaProva.due) }}
                </span>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">Nenhuma prova cadastrada</p>
          </div>
        </div>

        <!-- Atividades -->
        <div class="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
          <div class="h-1 bg-primary" />
          <div class="p-4 space-y-3">
            <div class="flex items-center gap-1.5">
              <ClipboardList :size="13" class="text-muted-foreground" />
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Atividades</span>
            </div>
            <div v-if="atividadesPendentes.length > 0">
              <p class="text-3xl font-bold text-foreground leading-none">{{ atividadesPendentes.length }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                pendente{{ atividadesPendentes.length > 1 ? 's' : '' }}
                <span v-if="proximaAtividade"> · próxima {{ labelRelativo(proximaAtividade.due).toLowerCase() }}</span>
              </p>
            </div>
            <p v-else class="text-sm text-muted-foreground">Nenhuma atividade pendente</p>
          </div>
        </div>
      </div>

      <!-- Camada 2: Agenda (só se houver itens) -->
      <AtividadesCard v-if="atividades.length > 0" :atividades="atividades" />

      <!-- Camada 3: Planejamento e Material (mock) -->
      <PlanoCard />

    </div>
  </div>
</template>
