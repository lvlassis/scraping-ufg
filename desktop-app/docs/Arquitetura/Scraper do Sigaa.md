# Componente - Scraper do Sigaa
[[Arquitetura]]

## Propósito
Componente que realiza a raspagem dos dados do Sigaa e disponibiliza de forma estruturada, para abastecer a base de dados.

## Responsabilidades Principais
- Raspar do Sigaa:
    - [ ] Lista de Matérias:
        - [ ] Nome da Matéria
        - [ ] Sala
        - [ ] Horário
        - [ ] Professor
            - [ ] Nome
            - [ ] Email
        - [ ] Suas Notas
        - [ ] Sua Frequência
            - [ ] Número de faltas
            - [ ] Dias que faltou
    - [ ] Lista de Atividades:
        - [ ] Nome da Atividade
        - [ ] Dia de Entrega
        - [ ] Matéria
    - [ ] Lista de Materiais enviados pelo Professor:
        - [ ] Nome do Material
        - [ ] Link p/ Download
    - [ ] Lista de Atualizações:
        - [ ] Nome da Atualização
        - [ ] Descrição
        - [ ] Data de Publicação
    - [ ] Metadados do Aluno:
        - [ ] Nome
        - [ ] Matricula
        - [ ] Email
        - [ ] Nível
        - [ ] Curso
        - [ ] Entrada
        - [ ] Status
        - [ ] IP
        - [ ] TA
        - [ ] TI
        - [ ] MGE
        - [ ] MRE
        - [ ] QR (Reprovações por falta)
        - [ ] PMF (Percentual Médio de Frequência)

## Entradas
- Cookie de sessão funcional

## Saídas
- Json com os dados raspados do Sigaa

## Dependências
- Não há

## Tecnologias Candidatas
- Scrapy:
    - Provê boa interface para separar responsabilidade de baixar a página e obter os dados. 
    - Boas interface para buscar os dados, suporte a xpath.

## Segurança
- Não persiste senhas, nem cookies, apenas realiza o acesso ao site, obtém o HTML e raspa os dados.
## Notas
(Decisões importantes, por que escolheu assim, etc)