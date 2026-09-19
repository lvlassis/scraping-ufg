# Fluxo de Login SIGAA

## Problema

O SIGAA utiliza Google reCAPTCHA na tela de login, o que impede qualquer automação direta via HTTP (ex: enviar um POST com usuário e senha). Qualquer tentativa de autenticar programaticamente resulta em bloqueio.

## Solução: BrowserWindow do Electron

O fluxo contorna o CAPTCHA abrindo uma janela de browser real (via Electron `BrowserWindow`) onde o usuário faz login manualmente. Após o login bem-sucedido, o app extrai os cookies de sessão programaticamente e fecha a janela.

O usuário passa pelo CAPTCHA normalmente; o app só observa o resultado.

## Fluxo passo a passo

```
Usuário clica "Entrar com SIGAA"
        │
        ▼
[Renderer] window.api.openSigaaLogin()
        │  IPC invoke: 'auth:openSigaaLogin'
        ▼
[Main] openSigaaLoginWindow()
        │  Abre BrowserWindow com partition: 'sigaa-login'
        │  Carrega: https://sigaa.sistemas.ufg.br/sigaa/verTelaLogin.do
        ▼
[Janela SIGAA] Usuário preenche login + CAPTCHA manualmente
        │
        ▼
[Main] webContents.on('did-navigate')
        │  SIGAA redireciona para /portais/discente/discente.jsf
        │  Evento disparado com a URL final
        ▼
[Main] session.cookies.get({ domain: 'sigaa.sistemas.ufg.br' })
        │  Extrai: _ufg_br_sess e JSESSIONID
        │  Monta: "_ufg_br_sess=...; JSESSIONID=..."
        │  Fecha a janela de login
        ▼
[Main] performLogin(cookieStr)
        │  POST http://127.0.0.1:8765/update?cookies=...
        │  Recebe: { matricula, nome, materias, ... }
        │  initDb(matricula)       → abre/cria {matricula}.sqlite
        │  upsertAccount(...)      → salva em accounts.json
        │  insertMaterias(...)     → popula banco do usuário
        ▼
[Main] retorna Account { matricula, nome }
        │  IPC response
        ▼
[Renderer] App.vue → onLoggedIn(account) → state = 'dashboard'
```

## Detalhes técnicos

### Por que `partition: 'sigaa-login'`?

O `partition` define a sessão de browser da `BrowserWindow`. Usando `'sigaa-login'` (sem o prefixo `persist:`), a sessão é **não-persistente**: começa limpa a cada abertura, sem cookies ou cache de sessões anteriores. Isso garante que o usuário sempre passe pelo fluxo de login completo.

Se fosse `persist:sigaa-login`, cookies seriam reutilizados entre sessões — o que poderia causar comportamento imprevisível se o cookie expirou mas ainda está armazenado.

### Detecção de login bem-sucedido

O evento `did-navigate` do `webContents` dispara ao fim de cada navegação completa (incluindo após redirects). O SIGAA, após login, redireciona para:

```
https://sigaa.sistemas.ufg.br/sigaa/portais/discente/discente.jsf
```

Verificamos se a URL contém `/portais/discente/discente.jsf`. Se sim, o login foi concluído.

### Cookies extraídos

| Cookie | Papel |
|---|---|
| `_ufg_br_sess` | Sessão Rails (autenticação principal) |
| `JSESSIONID` | Sessão Java/JSF (estado do servidor) |

Ambos são obrigatórios. O SIGAA rejeita requisições sem os dois.

### Flag `settled`

Previne condições de corrida: se `did-navigate` disparar múltiplas vezes (ex: redirecionamentos internos no portal), apenas a primeira detecção positiva resolve a Promise. O evento `closed` da janela rejeita a Promise caso o usuário feche manualmente antes de concluir o login.

## Arquivos envolvidos

| Arquivo | Responsabilidade |
|---|---|
| `src/main/index.ts` | `openSigaaLoginWindow()` e `performLogin()` |
| `src/preload/index.ts` | Expõe `openSigaaLogin` via `contextBridge` |
| `src/renderer/src/views/Login.vue` | Botão que dispara o fluxo |
| `src/renderer/src/views/AccountSelect.vue` | Seleção entre contas já conhecidas |
| `src/main/model/accounts.ts` | Persiste lista de contas em `accounts.json` |
| `src/main/db/index.ts` | Abre o banco SQLite isolado por matrícula |
