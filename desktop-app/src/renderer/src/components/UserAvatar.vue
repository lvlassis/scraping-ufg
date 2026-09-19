<script setup lang="ts">
defineProps<{
  nome: string
  size?: 'sm' | 'md' | 'lg'
}>()

function iniciais(nome: string): string {
  const partes = nome.trim().split(' ')
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase()
}
</script>

<template>
  <div
    class="rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold select-none shrink-0"
    :class="{
      'w-8 h-8 text-xs': size === 'sm',
      'w-9 h-9 text-sm': size === 'md' || !size,
      'w-14 h-14 text-lg': size === 'lg',
    }"
  >
    {{ iniciais(nome) }}
  </div>
</template>
