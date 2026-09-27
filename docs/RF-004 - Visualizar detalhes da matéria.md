# RF-004 - Visualizar detalhes da matéria

- **Status:** Planejado 
- **Tipo:** Funcional 
- **Data de Criação:** 21/09/2026
- **Última Atualização:** 21/09/2026
- **Dependências:** [[RF-005 - Registrar livro texto]]

## Descrição
O usuário deve ser capaz de ter uma central de comando daquela matéria com informações relevantes, como:
- Lista de Atividades Pendentes
- Livro Texto
- Professor
- Sala
- Horário


## Critérios de aceitação
- [x] Botão da matéria no Dashboard principal leva para o dashboard da matéria
- [x] View detalhes da matéria 
- [x] Lista de atividades pendentes (View DetalhesMatéria)
- [x] Painel informativo com: 
    - [x] Horário
    - [x] Sala
    - [ ] Professor
    - [ ] Contato do Professor
    - [ ] Livro Texto 

## Implementado em
- `src/services/authentication.ts` (linha XXX)
- `src/utils/validators.ts` (função `validateUser`)
