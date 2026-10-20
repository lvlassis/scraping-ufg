<script setup lang="ts">
import { ref } from 'vue'
import { KeyRound, Trash2 } from 'lucide-vue-next'
import type { ConnectorStatus } from '../../types/api'

const props = defineProps<{
  plugin: ConnectorStatus | null
}>()

const emit = defineEmits<{
  connected: []
  disconnected: []
  toggled: [enabled: boolean]
}>()

const username = ref('')
const password = ref('')
const saving = ref(false)
const error = ref('')

function parseError(e: unknown): string {
  if (!(e instanceof Error)) return 'Erro ao conectar'
  // Remove o prefixo IPC: "Error invoking remote method 'xxx': Error: <msg>"
  const match = e.message.match(/Error: (.+)$/)
  return match?.[1] ?? e.message
}

async function handleSave(): Promise<void> {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'Preencha usuário e senha'
    return
  }
  saving.value = true
  error.value = ''
  try {
    await window.api.addPlugin('turing', username.value.trim(), password.value)
    username.value = ''
    password.value = ''
    emit('connected')
  } catch (e) {
    error.value = parseError(e)
  } finally {
    saving.value = false
  }
}

async function handleToggle(): Promise<void> {
  if (!props.plugin) return
  await window.api.togglePlugin('turing', !props.plugin.enabled)
  emit('toggled', !props.plugin.enabled)
}

async function handleDisconnect(): Promise<void> {
  await window.api.removePlugin('turing')
  emit('disconnected')
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-lg font-semibold text-foreground">Turing UFG</h2>
      <p class="text-sm text-muted-foreground mt-1">
        Plataforma de Ensino Moodle do Instituto de Informática da UFG.
      </p>
    </div>

    <!-- Formulário de credenciais -->
    <div class="space-y-3">
      <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {{ plugin ? 'Atualizar credenciais' : 'Credenciais' }}
      </h3>
      <div class="space-y-3">
        <div class="space-y-1.5">
          <label class="text-xs text-muted-foreground">Usuário</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="Seu usuário do Turing"
            :disabled="saving"
            @keyup.enter="handleSave"
            class="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs text-muted-foreground">Senha</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Sua senha"
            :disabled="saving"
            @keyup.enter="handleSave"
            class="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          />
        </div>
        <button
          @click="handleSave"
          :disabled="saving"
          class="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer"
        >
          <KeyRound :size="14" />
          {{ saving ? 'Conectando...' : (plugin ? 'Atualizar credenciais' : 'Salvar e conectar') }}
        </button>
        <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
      </div>
    </div>

    <!-- Status e ações quando conectado -->
    <template v-if="plugin">
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
            <span class="text-xs text-muted-foreground">Usuário</span>
            <span class="text-xs text-foreground font-medium font-mono">{{ plugin.displayName ?? '—' }}</span>
          </div>
        </div>
      </div>

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

      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</h3>
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
    </template>
  </div>
</template>
