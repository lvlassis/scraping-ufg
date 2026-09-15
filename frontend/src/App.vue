<script setup>
import { ref } from 'vue'

const API = 'http://127.0.0.1:8765'

const cookies = ref('')
const status = ref('')
const data = ref(null)

async function atualizarDados() {
  if (!cookies.value.trim()) {
    status.value = 'Informe os cookies do SIGAA.'
    return
  }
  status.value = 'Buscando dados...'
  try {
    const res = await fetch(`${API}/update?cookies=${encodeURIComponent(cookies.value.trim())}`, {
      method: 'POST',
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail ?? res.statusText)
    }
    data.value = await res.json()
    status.value = 'Dados atualizados.'
  } catch (e) {
    status.value = `Erro: ${e.message}`
  }
}
</script>

<template>
  <main class="container">
    <h1>Academic</h1>

    <section>
      <label for="cookies-input">Cookie SIGAA</label>
      <textarea id="cookies-input" v-model="cookies" rows="3" placeholder="_ufg_br_sess=...; JSESSIONID=..." />
      <button @click="atualizarDados">Atualizar dados</button>
      <p>{{ status }}</p>
    </section>

    <section v-if="data">
      <h2>{{ data.nome }} ({{ data.matricula }})</h2>
      <p>{{ data.curso }} — MGE {{ data.mge }} | TI {{ data.ti }}% | TA {{ data.ta }}%</p>
    </section>

    <section v-if="data?.materias?.length">
      <h2>Matérias</h2>
      <ul>
        <li v-for="m in data.materias" :key="m.nome">{{ m.nome }} {{ m.horario }}</li>
      </ul>
    </section>

    <section v-if="data?.atividades?.length">
      <h2>Atividades</h2>
      <ul>
        <li v-for="a in data.atividades" :key="a.nome">
          [{{ a.tipo }}] {{ a.nome }} — {{ a.materia }} — {{ a.due ?? 'sem prazo' }}
        </li>
      </ul>
    </section>
  </main>
</template>
