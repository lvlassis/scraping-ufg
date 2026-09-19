<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import MateriaItem from './MateriaItem.vue'
import type { Materia } from '../../types/api'

defineProps<{
  materias: Materia[]
  semestre: string
}>()
</script>

<template>
  <div class="bg-background rounded-md border border-border shadow-md overflow-hidden h-full">
    <div class="h-1 bg-primary" />
    <div class="p-5">
      <div class="flex items-center gap-2 mb-4">
        <BookOpen :size="15" class="text-primary shrink-0" />
        <h2 class="font-semibold text-sm text-foreground">Matérias em Curso</h2>
        <span class="ml-auto text-xs text-muted-foreground">{{ materias.length }} disciplinas</span>
      </div>

      <div v-if="materias.length === 0" class="py-8 text-center text-sm text-muted-foreground">
        Nenhuma matéria para {{ semestre }}. Use o painel acima para atualizar.
      </div>

      <div v-else class="space-y-2">
        <MateriaItem v-for="m in materias" :key="m.id" :materia="m" />
      </div>
    </div>
  </div>
</template>
