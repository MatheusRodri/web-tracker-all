# TODO 002: Interface do Dashboard com Abas de Categoria

- [x] Criar styled-components para a barra de seleção de abas (Cursos, Livros e Shows) em `src/app/page.tsx`.
- [x] Implementar estado local no React (`activeCategory`) para monitorar a categoria ativa.
- [x] Atualizar a lógica do `useEffect` para ligar/desligar as inscrições em tempo real do Firestore (`subscribeToShows`, `subscribeToBooks`, `subscribeToCourses`) com base no UID do usuário autenticado.
- [x] Adaptar os filtros no topo do Dashboard de acordo com o status específico da categoria ativa.
- [x] Adicionar barra de busca local para filtrar itens por título em cada uma das categorias.
