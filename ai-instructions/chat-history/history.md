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
> - system, vai mudar, então pode até adapatar
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
