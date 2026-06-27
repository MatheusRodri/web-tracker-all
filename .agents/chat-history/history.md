# Histórico de Conversa - Tracker All

## Início do Tracker All e Reorganização de Diretórios
**Usuário:**
> Vamos fazer uma grande grande mudança.
> Atualmente o projeto é tracker shows. 
> Mas agora vai ser tracker all.
> Nele vai ter abas para o que quer trackear, inicialmente será Cursos, Livros e Shows ( Filme e serie)
> O que eu preciso agora.
> - Todo os os arquivos dentro de ai-instructions, fique em uma pasta separa informando que é legado ou algo do tipo.
> - o arquivo de rules, não muda então vai ter uma copia dele
> - system, vai mudar, então puede até adapatar
> - depois dessa parte feita, vamos alterar as demais partes

**Gemini:**
> Entendido! Criei a pasta de legado `ai-instructions/legacy/` e movi todo o histórico, To-Dos, rascunhos e o antigo `system.md` para lá. Mantive a regra de desenvolvimento em `ai-instructions/rules.md` (com cópia no legado), recriei o `ai-instructions/system.md` adaptado para o novo escopo do "Tracker All" e criei as pastas vazias para o novo fluxo.

---
## Criação de Tarefas de Expansão (To-Dos)
**Gemini:**
> Criei os arquivos de tarefas detalhados em `ai-instructions/To-Dos/` para orientar a implementação das três categorias do Tracker All.
>
> Proponho os seguintes commits individuais para esta etapa:


---
## Implementação da Modelagem e CRUD no Firestore
**Usuário:**
> Lembra que tem que alterar o nome dos arquivos package...

**Gemini:**
> Alterado o nome do projeto para `web-tracker-all` no `package-lock.json` e executado `npm install`. Adicionadas as interfaces `TrackedBook` e `TrackedCourse` e implementadas as funções CRUD correspondentes no Firestore (`add`, `update`, `delete`, `subscribeTo`). O build local do Next.js agora usa fallbacks fictícios das chaves no `firebase.ts` para compilar sem erros de pré-renderização estática na ausência de chaves locais.

---
## Interface com Abas de Categorias, Cards e Modais Específicos
**Usuário:**
> Ok, aprovo mas tem uma observação na tela de login tem o Tracker Shows, precisa alterar

**Gemini:**
> Implementamos em `page.tsx` a barra de seleção de categorias, grids específicos e os modais de CRUD para livros e cursos com barras de progresso visuais e capas geradas por CSS. Também atualizamos o título do projeto para `Tracker All` e os textos de suporte na página de login (`login/page.tsx`). O build passou com 100% de sucesso.

---
## Melhorias nos Formatos de Livros e Plataformas de Cursos
**Usuário:**
> Da mesma forma que em shows tem, tbm em livros e courses tbm. Ou seja em livros, terá: Kindle, Fisico, PDF. Em cursos: Alura, Udemy, Asimov, Hashtag, Youtube, Microsoft Learn. Pode adicionar outras opções se lembrar

**Gemini:**
> Atualizamos os selects e a validação do formulário em `page.tsx` para incluir as plataformas e formatos solicitados pelo usuário, bem como outras sugestões populares como Rocketseat, Pluralsight e EBAC. O build de produção compilou com sucesso.

---
## Métrica de Cursos Baseada em Minutos
**Usuário:**
> Outra melhoria. no curso, em uso minutos e não quantidade de aulas.
> Medir progresso por: Coloca como primeira opção Minutos.

**Gemini:**
> Alteramos a métrica de "Quantidade de Aulas" para "Minutos Assistidos" na interface e no Firestore (`totalMinutes` e `currentMinutes`), e reorganizamos a seleção nos modais para que "Minutos" seja o primeiro e o padrão. O build de produção compilou com sucesso.

---
## Importador de Filmes (Texto + CSV), Correção de Validação de 0 e Ordem Cronológica
**Usuário:**
> Vamos fazer algumas alterações no celular, ele não deixa tirar o 1 para algo novo que é 0. 
> Eu já tenho uma lista muito grande de filmes só que ela está em portugues. 
> Como seria o jeito mais facil de importar tudo isso para o site?

**Gemini:**
> Analisamos o comportamento de inputs numéricos e identificamos que campos como quantidade de vezes assistida/lida/concluída revertiam para 1 ao digitar 0 devido a validações `|| 1` em JavaScript. Propomos alterar para aceitar 0 como valor mínimo e inicializar itens não iniciados em 0. Para a importação, propomos criar um modal onde o usuário pode colar uma lista de títulos ou carregar um arquivo CSV, resolver as correspondências em português no OMDB, e revisar individualmente os registros antes da importação.

**Usuário:**
> E se for um arquivo csv essa lista?

**Gemini:**
> Atualizamos o plano para suportar tanto colagem de texto simples quanto upload de arquivo `.csv`, com detecção inteligente de cabeçalhos de colunas (título, status, plataforma, nota, ordem cronológica) em português e inglês.

**Usuário:**
> Um ponto muito importante é. Ordem dos filmes. Muitos filmes tem uma cronologia, então precisa ter uma opção que eu coloque o numero representando o ordem a ser assitida.

**Gemini:**
> Adicionamos a funcionalidade de "Ordem Cronológica" ao plano de importação e à dashboard. Os filmes terão o campo opcional `watchOrder`, um badge `#X` no card correspondente, e a dashboard ganhará a opção de ordenação cronológica.

**Usuário:**
> Está aprovado, vc lembra que tem fazer um compilado de tudo que estamos conversando aqui para manter o historico da conversa e por fim vc criou uma nova pasta de planos de implementação mas já existe essa pasta

**Gemini:**
> Corrigimos a pasta de planos de implementação para salvar em `.agents/implementation-plans/` (removendo a pasta duplicada no root) e atualizamos o histórico de conversas em `.agents/chat-history/history.md`.
