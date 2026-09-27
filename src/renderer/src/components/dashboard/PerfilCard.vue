<script setup lang="ts">
import UserAvatar from '../UserAvatar.vue'
import type { Account } from '../../types/api'

defineProps<{
  user: Account
  semestre: string
}>()
</script>

<template>
  <div class="bg-muted rounded-md border border-border p-6 flex flex-col gap-4 h-full">
    <div class="flex flex-col items-center gap-2 text-center">
      <UserAvatar :nome="user.nome" size="lg" />
      <div>
        <p class="font-medium text-sm text-foreground leading-snug">{{ user.nome }}</p>
        <p class="text-xs text-muted-foreground">{{ user.matricula }}</p>
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
</template>
