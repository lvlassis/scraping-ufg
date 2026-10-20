<script setup lang="ts">
import { Construction } from 'lucide-vue-next'
import type { ConnectorInfo } from '../../types/api'

defineProps<{ connector: ConnectorInfo }>()
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-lg font-semibold text-foreground">{{ connector.displayName }}</h2>
      <p class="text-sm text-muted-foreground mt-1">{{ connector.description ?? 'Conector externo.' }}</p>
    </div>

    <div class="rounded-lg border border-border p-8 flex flex-col items-center gap-3 text-center">
      <Construction :size="28" class="text-muted-foreground" />
      <p class="text-sm font-medium text-foreground">Em desenvolvimento</p>
      <p class="text-xs text-muted-foreground max-w-xs">
        O suporte para {{ connector.displayName }} ainda está sendo implementado.
        Fique de olho nas próximas atualizações.
      </p>
    </div>
  </div>
</template>
