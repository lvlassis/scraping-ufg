# E010 - Suporte a Múltiplas Bases de Dados

- **Status:** Planejado 
- **Tipo:** Épico
- **Data de Criação:** 17/10/2026
- **Última Atualização:** 17/10/2026

## Descrição
Como usuário, quero poder conectar a diversas fontes de dados, não só o Sigaa: 
- Turing
- Classroom

Dessa forma, gostaria de um sistema de plugins que me permita instalar um "Conector" do Turing, outro ao Classroom... E por aí vai.

### Considerações pessoais
Isso vai exigir uma arquitetura de microkernel e será inteligente refatorar o suporte atual ao sigaa como apenas mais um "Conector" que já vem instalado por padrão.

Idealmente, o código fonte dos plugins deve estar disponível no github para download. Talvez possa existir um repositório oficiais de plugins, sem perder a generalidade de instalar plugins de qualquer repositório de terceiros.

Será importante ter uma interface bem definida para os plugins.
## Critérios de aceitação
- [ ] 
## Sub Tarefas
- [[E001T01 - Refatorar para Arquitetura de Microkernel]]

## Implementado em
- `src/` (linha XXX)
