<script setup lang="ts">
import { ref } from 'vue'
import { BookText, FileText, ChevronDown, GraduationCap, MonitorPlay } from 'lucide-vue-next'

const planoAberto = ref(false)
const materialAberto = ref(false)

type StatusAula = 'passada' | 'atual' | 'futura'

const plano: { semana: number; topico: string; status: StatusAula }[] = [
  { semana: 1,  topico: 'Apresentação da disciplina e critérios de avaliação', status: 'passada' },
  { semana: 2,  topico: 'Fundamentos teóricos I',                               status: 'passada' },
  { semana: 3,  topico: 'Fundamentos teóricos II',                              status: 'passada' },
  { semana: 4,  topico: 'Metodologia e técnicas',                               status: 'passada' },
  { semana: 5,  topico: 'Aplicações práticas I',                                status: 'passada' },
  { semana: 6,  topico: 'Aplicações práticas II',                               status: 'passada' },
  { semana: 7,  topico: 'Seminários — apresentações dos grupos',                status: 'passada' },
  { semana: 8,  topico: 'Revisão para P1',                                      status: 'passada' },
  { semana: 9,  topico: '— Recesso / P1 —',                                     status: 'passada' },
  { semana: 10, topico: 'Tópicos avançados I',                                  status: 'passada' },
  { semana: 11, topico: 'Tópicos avançados II',                                 status: 'atual'   },
  { semana: 12, topico: 'Estudo de caso aplicado',                              status: 'futura'  },
  { semana: 13, topico: 'Projeto integrador',                                   status: 'futura'  },
  { semana: 14, topico: 'Apresentações finais',                                 status: 'futura'  },
  { semana: 15, topico: 'Revisão para P2',                                      status: 'futura'  },
  { semana: 16, topico: '— P2 / Avaliação Final —',                            status: 'futura'  },
  { semana: 17, topico: 'Prova substitutiva',                                   status: 'futura'  },
  { semana: 18, topico: 'Resultado e encerramento',                             status: 'futura'  },
]

const material = [
  {
    icone: BookText,
    titulo: 'Livro-texto principal',
    descricao: 'SOBRENOME, N.; SOBRENOME, N. Título do Livro. 3. ed. Cidade: Editora, 2020.',
  },
  {
    icone: FileText,
    titulo: 'Referência complementar',
    descricao: 'SOBRENOME, N. et al. Título do Artigo. Periódico, v. X, n. X, p. XX–XX, 2019.',
  },
  {
    icone: MonitorPlay,
    titulo: 'Slides das aulas',
    descricao: 'Disponíveis no portal SIGAA da disciplina.',
  },
]

const statusClasses: Record<StatusAula, string> = {
  passada: 'text-muted-foreground line-through',
  atual:   'text-primary font-semibold',
  futura:  'text-foreground',
}

const dotClasses: Record<StatusAula, string> = {
  passada: 'bg-muted-foreground/40',
  atual:   'bg-primary ring-2 ring-primary/30',
  futura:  'bg-border',
}
</script>

<template>
  <div class="space-y-3">
    <!-- Planejamento das Aulas -->
    <div class="bg-background rounded-md border border-border shadow-sm overflow-hidden">
      <div class="h-1 bg-primary" />
      <button
        class="w-full flex items-center gap-2 p-5 text-left cursor-pointer"
        @click="planoAberto = !planoAberto"
      >
        <GraduationCap :size="15" class="text-primary shrink-0" />
        <span class="font-semibold text-sm text-foreground flex-1">Planejamento das Aulas</span>
        <span class="text-xs text-muted-foreground mr-2">mock</span>
        <ChevronDown
          :size="14"
          class="text-muted-foreground transition-transform duration-200 shrink-0"
          :class="planoAberto ? 'rotate-180' : ''"
        />
      </button>

      <div v-if="planoAberto" class="px-5 pb-5">
        <div class="relative">
          <div class="absolute left-[5px] top-0 bottom-0 w-px bg-border" />
          <div class="space-y-3">
            <div
              v-for="aula in plano"
              :key="aula.semana"
              class="flex items-start gap-3"
            >
              <div
                class="w-[11px] h-[11px] rounded-full shrink-0 mt-1 z-10"
                :class="dotClasses[aula.status]"
              />
              <div class="flex-1 min-w-0">
                <span class="text-xs" :class="statusClasses[aula.status]">
                  Semana {{ aula.semana }} — {{ aula.topico }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Material de Estudo -->
    <div class="bg-background rounded-md border border-border shadow-sm overflow-hidden">
      <div class="h-1 bg-primary" />
      <button
        class="w-full flex items-center gap-2 p-5 text-left cursor-pointer"
        @click="materialAberto = !materialAberto"
      >
        <BookText :size="15" class="text-primary shrink-0" />
        <span class="font-semibold text-sm text-foreground flex-1">Material de Estudo</span>
        <span class="text-xs text-muted-foreground mr-2">mock</span>
        <ChevronDown
          :size="14"
          class="text-muted-foreground transition-transform duration-200 shrink-0"
          :class="materialAberto ? 'rotate-180' : ''"
        />
      </button>

      <div v-if="materialAberto" class="px-5 pb-5 space-y-3">
        <div
          v-for="(item, i) in material"
          :key="i"
          class="flex items-start gap-3 p-3 rounded-md bg-muted/50 border border-border"
        >
          <component :is="item.icone" :size="14" class="text-primary mt-0.5 shrink-0" />
          <div>
            <p class="text-xs font-medium text-foreground">{{ item.titulo }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ item.descricao }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
