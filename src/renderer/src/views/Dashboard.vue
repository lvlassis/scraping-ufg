<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MateriasCard from '../components/dashboard/MateriasCard.vue'
import PerfilCard from '../components/dashboard/PerfilCard.vue'
import DashboardMateria from './DashboardMateria.vue'
import type { Workspace, Materia, ConnectorStatus } from '../types/api'
import { useNavigation } from '../composables/useNavigation'

const props = defineProps<{ workspace: Workspace }>()
const emit = defineEmits<{ 'add-plugin': [] }>()

const nav = useNavigation()

function getSemestreAtual(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  return month <= 6 ? `${year}.1` : `${year}.2`
}

const semestre = getSemestreAtual()
const materias = ref<Materia[]>([])
const plugins = ref<ConnectorStatus[]>([])

const currentMateria = computed(() => {
  const entry = nav.current.value
  return entry.view === 'materia' ? entry.materia : null
})

async function carregarDados(): Promise<void> {
  ;[materias.value, plugins.value] = await Promise.all([
    window.api.getMateriasPorSemestre(semestre),
    window.api.getPlugins(),
  ])
}

onMounted(() => {
  nav.reset()
  carregarDados()
})
</script>

<template>
  <DashboardMateria
    v-if="currentMateria"
    :materia="currentMateria"
    :semestre="semestre"
    @back="nav.back()"
  />

  <div v-else class="p-6">
    <div class="max-w-3xl mx-auto">
      <div class="mb-5">
        <h1 class="text-xl font-semibold text-foreground">Início</h1>
        <p class="text-sm text-muted-foreground">{{ semestre }}</p>
      </div>

      <!-- Empty state when no plugins configured -->
      <div
        v-if="plugins.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-4 text-center"
      >
        <p class="text-sm font-medium text-foreground">Nenhum conector configurado</p>
        <p class="text-xs text-muted-foreground max-w-xs">
          Adicione um conector para começar a visualizar suas matérias e atividades.
        </p>
        <button
          @click="emit('add-plugin')"
          class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Adicionar conector
        </button>
      </div>

      <div v-else class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <MateriasCard :materias="materias" :semestre="semestre" @select="nav.navigate({ view: 'materia', materia: $event })" />
        </div>
        <div class="col-span-1">
          <PerfilCard
            :workspace="props.workspace"
            :plugins="plugins"
            :semestre="semestre"
            :materias-count="materias.length"
          />
        </div>
      </div>
    </div>
  </div>
</template>
