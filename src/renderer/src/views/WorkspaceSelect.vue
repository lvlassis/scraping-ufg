<script setup lang="ts">
import { ref } from 'vue'
import { Plus, MoreVertical, Trash2, FolderOpen } from 'lucide-vue-next'
import type { Workspace } from '../types/api'

defineProps<{ workspaces: Workspace[] }>()

const emit = defineEmits<{
  selected: [workspace: Workspace]
  'create-new': []
  removed: [id: string]
}>()

const openMenuFor = ref<string | null>(null)

async function handleSelect(ws: Workspace): Promise<void> {
  const opened = await window.api.openWorkspace(ws.id)
  if (opened) emit('selected', opened)
}

async function handleRemove(id: string): Promise<void> {
  openMenuFor.value = null
  await window.api.removeWorkspace(id)
  emit('removed', id)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="w-full max-w-sm space-y-6">
    <div class="text-center space-y-1">
      <p class="text-xl font-semibold text-foreground">Academia</p>
      <p class="text-sm text-muted-foreground">Escolha um workspace</p>
    </div>

    <div class="space-y-2">
      <div
        v-for="ws in workspaces"
        :key="ws.id"
        class="relative"
      >
        <div
          v-if="openMenuFor === ws.id"
          class="fixed inset-0 z-10"
          @click="openMenuFor = null"
        />

        <div
          @click="handleSelect(ws)"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-secondary transition-colors cursor-pointer"
        >
          <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <FolderOpen :size="16" class="text-primary" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-foreground truncate">{{ ws.name }}</p>
            <p class="text-xs text-muted-foreground">Criado em {{ formatDate(ws.createdAt) }}</p>
          </div>
          <button
            @click.stop="openMenuFor = openMenuFor === ws.id ? null : ws.id"
            class="relative z-20 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <MoreVertical :size="15" />
          </button>
        </div>

        <div
          v-if="openMenuFor === ws.id"
          class="absolute right-0 top-full mt-1 z-20 bg-background border border-border rounded-md shadow-lg py-1 w-44"
        >
          <button
            @click="handleRemove(ws.id)"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-secondary transition-colors cursor-pointer"
          >
            <Trash2 :size="13" />
            Remover workspace
          </button>
        </div>
      </div>

      <button
        @click="emit('create-new')"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-border hover:bg-secondary transition-colors text-muted-foreground cursor-pointer"
      >
        <div class="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Plus :size="16" />
        </div>
        <span class="text-sm">Novo workspace</span>
      </button>
    </div>
  </div>
</template>
