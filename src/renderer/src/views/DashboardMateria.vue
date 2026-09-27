<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import InfoCard from '../components/materia/InfoCard.vue'
import AtividadesCard from '../components/materia/AtividadesCard.vue'
import type { Materia, Atividade } from '../types/api'

const props = defineProps<{ materia: Materia; semestre: string }>()
const emit = defineEmits<{ back: [] }>()

const atividades = ref<Atividade[]>([])

onMounted(async () => {
  atividades.value = await window.api.getAtividadesPorMateria(props.materia.nome, props.semestre)
})
</script>

<template>
  <div class="p-6">
    <button
      class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"
      @click="emit('back')"
    >
      <ArrowLeft :size="14" />
      Voltar
    </button>

    <div class="mb-5">
      <h1 class="text-xl font-semibold text-foreground">{{ materia.nome }}</h1>
      <p class="text-sm text-muted-foreground">{{ semestre }}</p>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <AtividadesCard :atividades="atividades" />
      </div>
      <div class="col-span-1">
        <InfoCard :materia="materia" />
      </div>
    </div>
  </div>
</template>
