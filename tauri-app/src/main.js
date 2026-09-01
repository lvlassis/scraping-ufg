const API = "http://127.0.0.1:8765";

async function update(cookies) {
  const res = await fetch(`${API}/update?cookies=${encodeURIComponent(cookies)}`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? res.statusText);
  }
  return res.json();
}

function render(data) {
  document.getElementById("nome").textContent = `${data.nome} (${data.matricula})`;
  document.getElementById("curso").textContent = `${data.curso} — MGE ${data.mge} | TI ${data.ti}% | TA ${data.ta}%`;
  document.getElementById("perfil").hidden = false;

  const materiasList = document.getElementById("materias");
  materiasList.innerHTML = "";
  for (const m of data.materias ?? []) {
    const li = document.createElement("li");
    li.textContent = `${m.nome}  ${m.horario}`;
    materiasList.appendChild(li);
  }
  document.getElementById("materias-section").hidden = false;

  const atividadesList = document.getElementById("atividades");
  atividadesList.innerHTML = "";
  for (const a of data.atividades ?? []) {
    const li = document.createElement("li");
    li.textContent = `[${a.tipo}] ${a.nome} — ${a.materia} — ${a.due ?? "sem prazo"}`;
    atividadesList.appendChild(li);
  }
  document.getElementById("atividades-section").hidden = false;
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-update").addEventListener("click", async () => {
    const cookies = document.getElementById("cookies-input").value.trim();
    const status = document.getElementById("status");

    if (!cookies) {
      status.textContent = "Informe os cookies do SIGAA.";
      return;
    }

    status.textContent = "Buscando dados...";
    try {
      const data = await update(cookies);
      render(data);
      status.textContent = "Dados atualizados.";
    } catch (e) {
      status.textContent = `Erro: ${e.message}`;
    }
  });
});
