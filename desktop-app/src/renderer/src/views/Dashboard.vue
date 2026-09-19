<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BookOpen } from 'lucide-vue-next'
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
const cookies = ref('')
const updating = ref(false)
const updateError = ref('')

async function carregarMaterias(): Promise<void> {
  materias.value = await window.api.getMateriasPorSemestre(semestre)
}

async function handleUpdate(): Promise<void> {
  if (!cookies.value.trim()) return
  updating.value = true
  updateError.value = ''
  try {
    await window.api.updateMaterias(cookies.value.trim())
    await carregarMaterias()
    cookies.value = ''
  } catch (e) {
    updateError.value = e instanceof Error ? e.message : 'Erro desconhecido'
  } finally {
    updating.value = false
  }
}

function diasDaSemana(horario: string): string {
  return horario.split(' ')[0]
}

function horaDaSemana(horario: string): string {
  return horario.split(' ').slice(1).join(' ')
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(' ')
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase()
}

onMounted(carregarMaterias)
</script>

<template>
  <div class="p-6">
    <div class="mb-5">
      <h1 class="text-xl font-semibold text-foreground">Início</h1>
      <p class="text-sm text-muted-foreground">{{ semestre }}</p>
    </div>

    <!-- Painel temporário de atualização -->
    <div class="mb-5 p-4 rounded-md border border-border bg-background space-y-2">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Atualizar dados (temporário)</p>
      <div class="flex gap-2">
        <input
          v-model="cookies"
          type="text"
          placeholder="Cole os cookies SIGAA aqui..."
          class="flex-1 text-sm px-3 py-1.5 rounded-md border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          @click="handleUpdate"
          :disabled="updating || !cookies.trim()"
          class="text-sm px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {{ updating ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>
      <p v-if="updateError" class="text-xs text-destructive">{{ updateError }}</p>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <!-- Matérias em curso -->
      <div class="col-span-2 bg-background rounded-md border border-border shadow-md overflow-hidden">
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
            <div
              v-for="m in materias"
              :key="m.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border hover:bg-secondary transition-colors"
            >
              <div class="w-1 h-8 rounded-full bg-primary shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ m.nome }}</p>
                <p class="text-xs text-muted-foreground">{{ m.local }}</p>
              </div>
              <div class="text-right shrink-0 ml-4">
                <p class="text-xs font-medium text-foreground">{{ diasDaSemana(m.horario) }}</p>
                <p class="text-xs text-muted-foreground">{{ horaDaSemana(m.horario) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Perfil do aluno -->
      <div class="col-span-1 bg-muted rounded-md border border-border p-6 flex flex-col gap-4">
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-lg select-none">
            {{ iniciais(props.user.nome) }}
          </div>
          <div>
            <p class="font-medium text-sm text-foreground leading-snug">{{ props.user.nome }}</p>
            <p class="text-xs text-muted-foreground">{{ props.user.matricula }}</p>
          </div>
        </div>

        <div class="h-px bg-border" />

        <div class="space-y-3 text-sm">
          <div>
            <p class="text-xs text-muted-foreground mb-0.5">Semestre atual</p>
            <p class="text-foreground">{{ semestre }}</p>
          </div>
        </div>
      </div>

      <!-- Inferior esquerdo: placeholder -->
      <div class="col-span-1 bg-muted rounded-md border border-border p-5 flex items-center justify-center min-h-36">
        <p class="text-sm text-muted-foreground">Em breve</p>
      </div>

      <!-- Inferior direito: placeholder -->
      <div class="col-span-2 bg-muted rounded-md border border-border p-5 flex items-center justify-center min-h-36">
        <p class="text-sm text-muted-foreground">Em breve</p>
      </div>
    </div>
  </div>
</template>
