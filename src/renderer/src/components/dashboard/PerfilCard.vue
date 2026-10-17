<script setup lang="ts">
import UserAvatar from '../UserAvatar.vue'
import type { Account } from '../../types/api'

defineProps<{
  user: Account
  semestre: string
  materiasCount: number
}>()
</script>

<template>
  <div class="bg-background rounded-md border border-border shadow-md overflow-hidden">
    <div class="h-1 bg-primary" />
    <div class="p-5 flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <UserAvatar :nome="user.nome" size="md" />
        <div class="min-w-0">
          <p class="font-medium text-sm text-foreground leading-snug truncate">{{ user.nome }}</p>
          <p class="text-xs text-muted-foreground">{{ user.matricula }}</p>
        </div>
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
    </div>
  </div>
</template>
