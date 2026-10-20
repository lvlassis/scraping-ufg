<script setup lang="ts">
import { ref } from 'vue'
import { RefreshCw, LogIn, Trash2 } from 'lucide-vue-next'
import type { ConnectorStatus } from '../../types/api'

const props = defineProps<{
  plugin: ConnectorStatus | null
}>()

const emit = defineEmits<{
  connected: []
  disconnected: []
  toggled: [enabled: boolean]
}>()

const connecting = ref(false)
const reconnecting = ref(false)
const error = ref('')

async function handleConnect(): Promise<void> {
  connecting.value = true
  error.value = ''
  try {
    await window.api.addPlugin('sigaa-ufg')
    emit('connected')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro ao conectar'
  } finally {
    connecting.value = false
  }
}

async function handleReconnect(): Promise<void> {
  reconnecting.value = true
  error.value = ''
  try {
    await window.api.addPlugin('sigaa-ufg')
    emit('connected')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro ao reconectar'
  } finally {
    reconnecting.value = false
  }
}

async function handleToggle(): Promise<void> {
  if (!props.plugin) return
  await window.api.togglePlugin('sigaa-ufg', !props.plugin.enabled)
  emit('toggled', !props.plugin.enabled)
}

async function handleDisconnect(): Promise<void> {
  await window.api.removePlugin('sigaa-ufg')
  emit('disconnected')
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h2 class="text-lg font-semibold text-foreground">SIGAA UFG</h2>
      <p class="text-sm text-muted-foreground mt-1">
        Sistema Integrado de Gestão de Atividades Acadêmicas da Universidade Federal de Goiás.
      </p>
    </div>

    <!-- Not connected state -->
    <template v-if="!plugin">
      <div class="rounded-lg border border-border p-4 space-y-4">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-muted-foreground" />
          <span class="text-sm text-muted-foreground">Não conectado</span>
        </div>
        <p class="text-xs text-muted-foreground">
          Conecte sua conta do SIGAA para sincronizar matérias e atividades.
        </p>
        <button
          @click="handleConnect"
          :disabled="connecting"
          class="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer"
        >
          <LogIn :size="14" />
          {{ connecting ? 'Aguardando login...' : 'Conectar com SIGAA' }}
        </button>
      </div>
    </template>

    <!-- Connected state -->
    <template v-else>
      <!-- Account info -->
      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conta</h3>
        <div class="rounded-lg border border-border divide-y divide-border">
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-xs text-muted-foreground">Status</span>
            <div class="flex items-center gap-1.5">
              <div
                class="w-1.5 h-1.5 rounded-full"
                :class="plugin.enabled ? 'bg-green-500' : 'bg-muted-foreground'"
              />
              <span class="text-xs text-foreground">{{ plugin.enabled ? 'Ativo' : 'Desativado' }}</span>
            </div>
          </div>
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-xs text-muted-foreground">Nome</span>
            <span class="text-xs text-foreground font-medium">{{ plugin.displayName ?? '—' }}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-xs text-muted-foreground">Matrícula</span>
            <span class="text-xs font-mono text-foreground">{{ plugin.userId ?? '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Toggle -->
      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Configurações</h3>
        <div class="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <p class="text-sm text-foreground">Habilitado</p>
            <p class="text-xs text-muted-foreground">Inclui os dados deste conector no dashboard</p>
          </div>
          <button
            @click="handleToggle"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer focus:outline-none"
            :class="plugin.enabled ? 'bg-primary' : 'bg-muted-foreground/40'"
          >
            <span
              class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform"
              :class="plugin.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'"
            />
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</h3>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p class="text-sm text-foreground">Reconectar</p>
              <p class="text-xs text-muted-foreground">Renova as credenciais de acesso via login</p>
            </div>
            <button
              @click="handleReconnect"
              :disabled="reconnecting"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw :size="12" :class="{ 'animate-spin': reconnecting }" />
              {{ reconnecting ? 'Aguardando...' : 'Reconectar' }}
            </button>
          </div>

          <div class="flex items-center justify-between rounded-lg border border-destructive/30 px-4 py-3">
            <div>
              <p class="text-sm text-destructive">Desconectar</p>
              <p class="text-xs text-muted-foreground">Remove este conector do workspace</p>
            </div>
            <button
              @click="handleDisconnect"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-destructive/50 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Trash2 :size="12" />
              Desconectar
            </button>
          </div>
        </div>
      </div>
    </template>

    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
