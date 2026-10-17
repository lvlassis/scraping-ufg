# H008 - Dashboard Matéria Útil
- **Status:** Planejado 
- **Tipo:** História de Usuário 
- **Data de Criação:** 17/10/2026
- **Última Atualização:** 17/10/2026

## Descrição
Como usuário, minhas maiores preocupações de imediato são, nesta ordem:
1. Tem prova vindo?
2. Quando são as provas?
3. Tem atividade?
4. Para que dia são as atividades?
5. O professor postou algum planejamento das aulas? quais os conteúdos abordados nas aulas? To atrasado com algum conteúdo?
6. Tô de boa, quero ver os próximos temas da matéria. Qual o livro texto para estudar?

O Dashboard deve cumprir essas funções, ajudando o usuário a seguir esse fluxo mental e decidir o que deve estudar hoje.
## Critérios de aceitação
- [ ] 

## Implementação
### Feito
Foi implementado um dashboard que primeiro mostra se há prova vindo e quantas atividades existem. Se não há, eles ficam verdinhos e tudo certo, o aluno fica mais tranquilo.

Daí, logo abaixo, ele já mostra em ordem cronológica os compromissos do usuário em uma lista, para ele saber as atividades que possui e em qual ordem elas estão enumeradas.

Se o aluno quiser levar com a barriga o curso, essas são as únicas coisas que ele precisa se preocupar, por isso sua importância.

Daí, se ele quiser, também há a lista de conteúdos que o professor enviou pelo Sigaa / Turing:
- Planejamento das aulas e materiais / livros textos.

Por enquanto, só tenho acesso aos dados das atividades e provas (que na verdade estão todos juntos e misturados... precisaria verificar como que eles estão catalogados para poder separá-los).

### Falta
#### Materiais de Estudo
- Obter os **dados** dos **materiais de estudo**. 
- [ ] Fazer um scraping desses dados no Sigaa
#### Planejamento das Aulas
- Obter os dados dos planejamentos das aulas lá no Sigaa