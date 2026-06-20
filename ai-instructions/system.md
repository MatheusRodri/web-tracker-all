# Tracker All

Esse projeto é responsável por gerenciar e acompanhar itens de interesse do usuário divididos em três categorias principais: **Cursos**, **Livros** e **Shows (Filmes e Séries)**.

## Stack

- Next.js (App Router)
- Firebase (Auth + Firestore)
- TypeScript
- Styled-components
- API OMDB (para busca de Shows)

## Functional requirements

- O usuário pode fazer login com o e-mail e senha ou com Google (já implementado).
- O sistema possui uma barra de abas de navegação no painel principal para alternar entre as categorias: **Shows**, **Livros** e **Cursos**.
- Para cada categoria, o usuário pode adicionar, visualizar em tempo real, filtrar, pesquisar localmente, editar e remover itens da sua lista.

### 1. Aba de Shows (Filmes e Séries)
- O usuário pesquisa pelo filme/série na caixa de pesquisa integrada com a API OMDB.
- Ao selecionar uma sugestão, preenche automaticamente:
  - Quantidade de temporadas (para séries)
  - Duração em minutos
  - Produtoras
  - País de origem
  - Gênero
  - Diretor
- O usuário preenche os demais campos manuais:
  - Status (`Unwatched` -> Não Assistido, `Watching` -> Assistindo, `Watched` -> Assistido)
  - Temporada atual (para séries)
  - Episódio atual (para séries)
  - Total de episódios estimados (para séries)
  - Nota (1 a 5 estrelas)
  - Local/Plataforma de exibição (Netflix, Disney+, Prime Video, etc.)
  - Quantidade de vezes assistida

### 2. Aba de Livros
- O usuário adiciona um livro preenchendo as informações (inserção manual):
  - Título
  - Autor
  - Gênero
  - Quantidade total de páginas
  - Formato/Plataforma (Físico, Kindle, PDF, Audiobook)
- O usuário preenche e atualiza o progresso:
  - Status (`PlanToRead` -> Quero Ler, `Reading` -> Lendo, `Read` -> Lido)
  - Página atual
  - Nota (1 a 5 estrelas)
  - Quantidade de vezes lido

### 3. Aba de Cursos
- O usuário adiciona um curso preenchendo as informações (inserção manual):
  - Título
  - Plataforma de ensino (Udemy, Coursera, YouTube, Alura, etc.)
  - Quantidade total de aulas ou total de horas
- O usuário preenche e atualiza o progresso:
  - Status (`PlanToStart` -> Quero Começar, `Studying` -> Estudando, `Completed` -> Concluído)
  - Aula atual ou hora atual assistida
  - Nota (1 a 5 estrelas)
  - Quantidade de vezes concluído

### 4. Modais e Listagem
- Exibição de cards responsivos formatados de acordo com o progresso de cada categoria (ex: barra de progresso de páginas lidas, episódios vistos ou aulas concluídas).
- Ao clicar em um item, abre-se um modal específico com as informações, permitindo edição e exclusão.

## Non-functional requirements

- O sistema deve ser responsivo.
- O sistema deve ter um layout moderno, elegante (com tons escuros, glassmorphism e cores neon suaves de acordo com a categoria) e intuitivo.
- O sistema deve manter a segurança de dados e chaves no lado do servidor.
