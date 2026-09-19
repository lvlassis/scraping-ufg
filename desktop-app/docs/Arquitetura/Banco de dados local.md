# Componente - Banco de dados local
[[Home]]

## Propósito
Armazena todos os dados acadêmicos, provenientes de scraping, mais dados inseridos pelo usuário e configurações do Frontend. 

> Será que faz sentido misturar os dados do Scraping + frontend?

## Entidades Principais
(As tabelas/coleções do banco e seus campos-chave)

- Matéria:
    - Nome da matéria
    - Professor
    - Semestre
    - Lista de Alunos?
    - Sala
    - Horário
    - Lista de Data de Provas
    - Lista de Tópicos
        - Lista de Materiais
    - Lista de Livros Texto
    - Lista de Noticias
    - Plano de Ensino
    - Lista de Dias que faltei
    - Lista de Aulas Canceladas
    - Notas
- Professor:
    - Nome
    - Lista de Matérias que ele dá
    - Email
    - Telefone
    - Número de faltas
- Material:
    - Nome do Arquivo
    - Tópico
    - Link de Acesso
- Tópico:
    - Nome do Tópico
- Noticias de Turma
    - Data de Publicação
    - Conteúdo
    - Matéria
## Quem Escreve
- Preciso de um módulo que vai gerenciar a pipeline de scraping.

## Quem Lê
- Frontend do [[Aplicativo Desktop]]

## Características
- **Localização:** Local
- **Tipo:** Arquivo único
- **Usuários:** 1
- **Atualização:** Como os dados são atualizados? (ex: substituição completa a cada scraping, incremental, etc.)

## Tecnologias Candidatas
- SQLite

## Segurança
(Contém dados sensíveis? Como proteger?)
- Dados pessoais?
- Permissões de acesso ao arquivo?
- Criptografia necessária?

## Notas
Salvar os metadados do Aluno como um Json.

- Aluno: Dado Único?
    - Nome
    - Email
    - Toda a lista de metadados do Sigaa (IP, MGE...)
