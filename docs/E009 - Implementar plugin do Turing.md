# E009 - Implementar plugin do Turing

- **Status:** Planejado 
- **Tipo:** História de Usuário 
- **Data de Criação:** 19/10/2026
- **Última Atualização:** 19/10/2026

## Descrição
Como usuário, quero um plugin que me permita obter os dados do Turing. Quero ser capaz de adicionar minhas credenciais nas configurações do plugin, permitindo que os dados do Turing sejam scrapados sem necessidade de login manual. 

## Critérios de aceitação
- [ ] Plugin deve poder ser configurado com credenciais.
    - [ ] Scraping deve ser feito sem login manual
- [ ] Devem ser obtidos as listas de matérias salvas no Turing e a lista de atividades das matérias.
- [ ] O formato das matérias do Turing devem ser compatíveis com as do Sigaa

## Implementado em
- `src/` (linha XXX)
## Sub-Tarefas
- [ ] [[H010 - Criar biblioteca de Scraping do Turing]]

## Detalhes de implementação
O plugin deve registrar nas suas configurações, campos para o usuário inserir suas credenciais: usuário e senha. 

Daí, adicionar um Conector que consome do usuário e senha e por meio de scraping dos dados do site "turing.ufg.br" ele obtém os dados de Matérias e suas Atividades, para abastecer o Kernel. 

Será necessário implementar um módulo de scraping do turing o qual consegue obter as informações que eu preciso. (Por hora, acho que vale a pena implementar ele no próprio repositório, mas penso em migrar para uma biblioteca separada futuramente).

O módulo de scraping deve receber o login e senha como inputs e retornar as matérias que eu estiver matriculado, e buscar se há atividades / provas registradas lá. 

### Fluxo de Login
Para fazer login no turing, basta fazer um POST com `username`, `password` e `logintoken` na URL https://turing.inf.ufg.br/login/index.php. `username` e `password` são obtidos pelo usuário, pela configuração. Porém, para obter o `logintoken` é necessário antes fazer um GET para `https://turing.inf.ufg.br/login/index.php` e encontrar o elemento com  com o `logintoken`, acho que é possível fazer um find com regex por esse elemento para extrair o valor.
```
<input type="hidden" name="logintoken" value="PPn8VTmzxsSxt9wmSP8VmE3oHxYjNTt9">
```

Feito o POST para https://turing.inf.ufg.br/login/index.php é possível extrair os cookies para as próximas requisições. Exemplo de cookies retornados:
```
Cookie: _ga_XHRRZ6SBL1=GS2.1.s1789430369$o1$g0$t1789430372$j57$l0$h0; _ga=GA1.2.1358218016.1789430369; _ufg_br_sess=Mm5ySTY3Zi9BS241dVlUY0ZlWGxyNUV2YWxQeU9XaHRyd2J0ZVlULzNNazBIenVwSjgvWVhoL3VVVVJVYk1PVjZEU3RNWTRlditpM3BCU3Z3dDJqbmllMDExTzc4Y0dkNjErRG0xeUR1NHBITW9mdFZweTRoZnEwRGtHZG5ZcnNSQ3FnVkZkOWdHbGduck50dm1ldTd2Ly9Dc3FqaXBnWUF4Z290WmNvRDhkaDF6Znc2em5iWi9lQ3hoS3hLcXl6ZTVld2NXK3ExdXRWTWIxck13MWFmeFY0RDlqSWlweFBrUUxwNXFpYkRML1VYdW9sTW5kWjBOZkV0NGZENkNwbjNuRGZOZHFYdTVrdUpwOVRIeTNlYTBqZDZXMWZ4cUlVVkkxL0grVXRwaG1MZllXM3JmU0x2ZmFtUnd6WnhCeFF3aFBMOFEyRlo5UlhYbTF5VFE4ZHNRPT0tLSt4S0RLUUdkZXl5MTVKNWV3eXJLY2c9PQ%3D%3D--1568339511b80dbd9eb355f6622567ba5bd8c108; MoodleSession=jk1hna3osvc66dek2lu3tal905; MOODLEID1_=sodium%3APrgYmg2YIu11q2tCLgW4t0KYMsvBcBq8KsmnRY%2BIlRvOK20a8uXL4wMeXMlxFptE7g%3D%3D
```

Com a obtenção dos cookies, o login está feito.

### Obter as matérias
As matérias podem ser obtidas com um GET na url https://turing.inf.ufg.br/my/ e buscando pelo elemento `<ul id="course_list_in_block">`. Os filhos desse elemento são cards de matérias no seguinte formato:
```html
<ul id="course_list_in_block"><li class="course_list_item_in_block"><div class="li_course" data-id="965"><span role="button" aria-haspopup="false" data-drag-type="move"><i class="fa fa-arrows"></i></span> <i class="icon fa fa-graduation-cap fa-fw " title="Curso" role="img" aria-label="Curso"></i> <a href="https://turing.inf.ufg.br/course/view.php?id=965">COMPILADORES I - 2026/2 (BEC)</a> <span class="expandable_icon">+</span></div><div class="course_modules" style="display: none"><ul class="course_modules_list_in_block"><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76406">Plano de Ensino 2026 - 2º semestre</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76429">Livro Texto</a></li><li><a href="https://turing.inf.ufg.br/mod/forum/view.php?id=76679">Comunicações Gerais</a></li><li><a>Conteúdo das Provas</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76407">Visão Geral de Compiladores - Parte I</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76408">Visão Geral - Arquitetura de Compiladores - Parte II</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76518">Linguagens Regulares</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76519">Analisador-Léxico - parte 1</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76768">Analisador-Léxico - parte 2</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76771">Trabalho Prático nr. 01 - T1</a></li><li><a href="https://turing.inf.ufg.br/mod/assign/view.php?id=76772">Entrega do Trabalho Prático nr. 01</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76801">Trabalho Prático nr. 02 - T2</a></li><li><a href="https://turing.inf.ufg.br/mod/assign/view.php?id=77100">Entrega do Trabalho nr. 02 - Analisador Léxico</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76896">Análise Sintática - Parte 1 - Introdução</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=77009">Análise Sintática - Parte 2 - Análise Ascendente (BU)</a></li></ul></div></li><li class="course_list_item_in_block"><div class="li_course" data-id="966"><span role="button" aria-haspopup="false" data-drag-type="move"><i class="fa fa-arrows"></i></span> <i class="icon fa fa-graduation-cap fa-fw " title="Curso" role="img" aria-label="Curso"></i> <a href="https://turing.inf.ufg.br/course/view.php?id=966">INTELIGÊNCIA COMPUTACIONAL - 2026/2 (BEC)</a> <span class="expandable_icon">+</span></div><div class="course_modules" style="display: none"><ul class="course_modules_list_in_block"><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76409">Plano de Ensino 2026 - 2º semestre</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76410">Introdução à Inteligência Artificial</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76411">Introdução à IA e Aprendizado</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76412">Cenários</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76520">Agentes - Ambientes - Busca 01</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76648">Busca 02</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76649">Busca 03</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76650">Busca 04</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76802">Busca 05</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76893">Algoritmos Genéticos</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76894">Otimização por Enxame de Partículas (PSO)</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76895">PSO em Visão Computacional (VC)</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76938">Aprendizado de Máquina</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=77008">Regressão Linear e KNN</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=77289">Regressão Logística</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=77290">ISLP - Chap 4 - Classification (Logistic Regression)</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=77291">Python Notebook - Logistic Regression (zip)</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76651">Atividade 1</a></li><li><a href="https://turing.inf.ufg.br/mod/assign/view.php?id=76652">Atividade 1 - Entrega da apresentação da equipe</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=77183">Atividade 2 - K-NN</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=77192">Dados-KNN-100-estudantes.csv</a></li><li><a href="https://turing.inf.ufg.br/mod/assign/view.php?id=77184">Atividade 2 - K-NN - Entrega</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=77336">Atividade 3 - Classificação de dígitos manuscritos pelo método Regressão Logística</a></li><li><a href="https://turing.inf.ufg.br/mod/assign/view.php?id=77337">Atividade 3 - Regressão Logística - Entrega</a></li><li><a href="https://turing.inf.ufg.br/mod/resource/view.php?id=76653">Artificial Intelligence - A Modern Approach - Russel &amp; Norvig - 4a ed</a></li><li><a>Conteúdo das Provas</a></li></ul></div></li></ul>
```
Daí, é necessário extrair o nome da Matéria desse card: `Compiladores 1` e `Inteligência Computacional`.

### Obter atividades por matéria
TO-DO