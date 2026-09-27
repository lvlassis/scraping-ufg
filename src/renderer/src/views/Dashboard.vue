<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MateriasCard from '../components/dashboard/MateriasCard.vue'
import PerfilCard from '../components/dashboard/PerfilCard.vue'
import UpdatePanel from '../components/dashboard/UpdatePanel.vue'
import DashboardMateria from './DashboardMateria.vue'
import type { Account, Materia } from '../types/api'

const props = defineProps<{ user: Account }>()

function getSemestreAtual(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  return month <= 6 ? `${year}.1` : `${year}.2`
}

const semestre = getSemestreAtual()
const materias = ref<Materia[]>([])
const selectedMateria = ref<Materia | null>(null)

async function carregarMaterias(): Promise<void> {
  materias.value = await window.api.getMateriasPorSemestre(semestre)
}

onMounted(carregarMaterias)
</script>

<template>
  <DashboardMateria
    v-if="selectedMateria"
    :materia="selectedMateria"
    :semestre="semestre"
    @back="selectedMateria = null"
  />

  <div v-else class="p-6">
    <div class="mb-5">
      <h1 class="text-xl font-semibold text-foreground">Início</h1>
      <p class="text-sm text-muted-foreground">{{ semestre }}</p>
    </div>

    <UpdatePanel class="mb-5" @updated="carregarMaterias" />

    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <MateriasCard :materias="materias" :semestre="semestre" @select="selectedMateria = $event" />
      </div>
      <div class="col-span-1">
        <PerfilCard :user="props.user" :semestre="semestre" />
      </div>
      <div class="col-span-1 bg-muted rounded-md border border-border p-5 flex items-center justify-center min-h-36">
        <p class="text-sm text-muted-foreground">Em breve</p>
      </div>
      <div class="col-span-2 bg-muted rounded-md border border-border p-5 flex items-center justify-center min-h-36">
        <p class="text-sm text-muted-foreground">Em breve</p>
      </div>
    </div>
  </div>
</template>
