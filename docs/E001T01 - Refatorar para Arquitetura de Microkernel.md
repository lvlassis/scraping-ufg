# E001T01 - Refatorar para Arquitetura de Microkernel

- **Status:** Planejado 
- **Tipo:** Tarefa
- **Data de Criação:** 18/10/2026
- **Última Atualização:** 18/10/2026

## Descrição
Vamos refatorar para que o Sigaa Desktop vire um Kernel que recebe dados de Matérias, Atividades... de outros plugins. A parte de scraping do Sigaa vai virar um plugin que vem instalado por padrão.

Cada plugin vai ter que ter uma interface bem definida, uma função de `load()` e vai poder acessar *bindings* e *hooks* que o kernel vai expor para registrar os seus métodos.

## Questões
- [ ] Como será a Interface do Kernel?
- [ ] Como será a Interface dos Plugins?
- [ ] Onde os plugins devem ser instalados para serem carregados pelo Kernel?

## Prompt
Olá, este projeto se trata de uma plataforma na qual o estudante pluga um Conector do site de sua universidade e consegue obter os dados de Atividades, datas de Provas, conteúdos que o professor envia... Daí por hora, estava fazendo de maneira específica para obter os dados do Sigaa da UFG, mas eu quero expandir para uma arquitetura baseada em microkernel de forma que a integração com o sigaa se torne um plugin, e eu possa adicionar plugins de Conectores do Classroom e da plataforma Turing (criada pelo instituto de informática). O meu próprio caso de uso necessita do suporte a esses 3 conectores, pois cada professor meu usa uma das plataformas. Dessa forma, estou estudando como que poderia ficar a arquitetura do sistema de plugins.

Estou planejando aqui como que ficaria a organização das interfaces de kernel e plugins. Qual seria a forma de instalar plugins. O que os plugins poderiam fornecer ao Kernel.

Sobre meu caso de uso, eu preciso de plugins que atuem como "Conectores" eles são plugins que fornecem implementações de métodos que buscam na internet por dados que abastecem o sistema do Kernel. Então, nesse caso, o kernel teria alguns campos que podem ser abastecidos pelos conectores, como:
- Matérias
- Atividades

A intenção é que podem ser plugados vários conectores, para obter dados de matérias, atividades... de diversas fontes diferentes.

Eu gostaria que o sistema de plugins fosse pensado de forma mais ampla, a não se limitar ao caso de uso de Conectores, podendo futuramente fornecer modificações de estilo, implementar outras views, teclas de atalhos, opções de configuração...

Daí seguinte. Consegue me dar uma ilustração de como que poderia refatorar a configuração atual para que seja implementado uma arquitetura de microkernel e que os recursos atuais de integração com o Sigaa se tornem um plugin?

## 