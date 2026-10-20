<script setup lang="ts">
import type { Workspace, ConnectorStatus } from '../../types/api'

defineProps<{
  workspace: Workspace
  plugins: ConnectorStatus[]
  semestre: string
  materiasCount: number
}>()
</script>

<template>
  <div class="bg-background rounded-md border border-border shadow-md overflow-hidden">
    <div class="h-1 bg-primary" />
    <div class="p-5 flex flex-col gap-4">
      <div>
        <p class="font-medium text-sm text-foreground leading-snug">{{ workspace.name }}</p>
        <p class="text-xs text-muted-foreground mt-0.5">Workspace</p>
      </div>

      <div class="h-px bg-border" />

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-md bg-muted p-3">
          <p class="text-xs text-muted-foreground mb-0.5">Semestre</p>
          <p class="text-sm font-semibold text-foreground">{{ semestre }}</p>
        </div>
        <div class="rounded-md bg-muted p-3">
          <p class="text-xs text-muted-foreground mb-0.5">Matérias</p>
          <p class="text-sm font-semibold text-foreground">{{ materiasCount }}</p>
        </div>
      </div>

      <div v-if="plugins.length > 0" class="space-y-1.5">
        <p class="text-xs font-medium text-muted-foreground">Conectores ativos</p>
        <div
          v-for="p in plugins"
          :key="p.connectorId"
          class="flex items-center gap-2"
        >
          <div class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          <p class="text-xs text-foreground truncate">
            {{ p.displayName ?? p.connectorDisplayName }}
            <span class="text-muted-foreground"> · {{ p.connectorDisplayName }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
