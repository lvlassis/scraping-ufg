# RN-001 - Isolamento de dados entre contas

**Status:** ⏳ Planejado 

**Tipo:** Não-funcional

**Descrição:**
Os dados de cada usuário devem estar separados em bancos distintos, e criptografados, de forma que:
1. Operações de um usuário não possam afetar os dados de outro
2. Alguém que acesse o banco de maneira externa não consiga ter acesso aos dados

**Critérios de Aceitação:**
- [x] Bancos de dados separados por usuário
- [ ] Bancos de dados criptografados

**Implementado Em:**
- `src/services/authentication.ts` (linha XXX)
- `src/utils/validators.ts` (função `validateUser`)

**Data de Criação:** 2026-09-19
**Última Atualização:** 2026-09-19
