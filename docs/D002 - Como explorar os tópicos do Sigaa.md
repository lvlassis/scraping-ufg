# D002 - Como explorar os tópicos do Sigaa
17/10/2026

## Descrição
Então, um dos desafios que estou tendo é relativo à "Interpretação dos Tópicos do Sigaa", devido à sua versatilidade de usos pelos professores.

### Múltiplos casos de usos
Percebe-se que devido à natureza de uso versátil da ferramenta, será complicado padronizar a extração dos dados para um propósito geral em todas as matérias. 
- Alguns professores são mais metódicos e enviam o planejamento completo das aulas do semestre inteiro. 
- Outros professores são menos metódicos, e o utilizam apenas como canal para enviar Plano de Ensino e Materiais de Estudo (Slides, PDFs, Listas, Provas antigas...) 
- Outros enviam só o essencial (Plano de Ensino)
- Outros nem usam
### Parte boa
Felizmente, de forma semelhante a um milagre neste caso, o Sigaa percebe-se que o Sigaa por padrão força certa padronização na estrutura do texto, tornando-o muito semelhante a um texto em **Markdown**, e sempre adicionando nos *Headings* as datas aos quais o tópico se aplica. Dessa forma, torna-se mais fácil de extrair informações relevantes daquele mar de palavras, dando mais peso então ao desafio de agrupar as informações relevantes em categorias, olhando os dados disponíveis como: "Nomes dos Headings", "Nomes dos Arquivos", "Extensão"...

## O que extrair
- [[H008T01 - Implementar Scraping dos Materiais de Estudo de cada Matéria]]:
  É necessário conseguir encontrar os Materiais de Estudo que o professor postou para resolver o problema: [[Problemas#^9c0762]]
- [[H008T02 - Implementar Scraping do Planejamento das Aulas de cada Matéria]]
  Deve-se extrair o planejamento de cada dia de Aula para popular a Agenda da Matéria e para responder a pergunta: [[H008 - Dashboard Matéria Útil#^5b102c]]