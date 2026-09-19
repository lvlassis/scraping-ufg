# Componente - Aplicativo Desktop
[[Arquitetura]]

## Propósito
Programa em Electron que vai orquestrar o ciclo de vida do frontend e backend, no formato de um app de desktop.

## Responsabilidades Principais
- [ ] Entrypoint do programa
- [ ] Renderizar o Frontend
- [ ] Iniciar o backend
- [ ] Iniciar a API do [[Scraper do Sigaa]]

## Entradas
(O que ele recebe de outros componentes ou fontes extras?)

## Saídas
(O que ele produz para outros componentes?)

## Dependências
- 
- 

## Tecnologias Candidatas
- Tecnologia A

## Estrutura Interna
(Se o componente é grande, quebra em sub-componentes)
**Sub-componentes:**
- Sub-modulo A


## Fluxo de Dados Típico
(Descreva um cenário típico de uso)
**Exemplo:**
Frontend chama "Atualizar dados"
API recebe requisição
Scraper faz login no SIGAA
Scraper extrai atividades
API valida dados
API persiste no banco
API retorna dados normalizados
Frontend renderiza
## Segurança
(Como este componente lida com dados sensíveis?)
- Credenciais do SIGAA?
- Dados pessoais?
- Autenticação?
## Notas
(Decisões importantes, por que escolheu assim, etc)