# TODO 007: Refatoração do page.tsx e Setup de Testes

- [x] Instalar dependências de teste (`jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) no `package.json`.
- [x] Criar arquivos de configuração `jest.config.js` e `jest.setup.ts`.
- [x] Criar o arquivo `src/app/styles.ts` contendo todos os componentes de estilo (`styled-components`) extraídos de `page.tsx`.
- [x] Criar o arquivo `src/utils/helpers.tsx` contendo constantes globais e funções utilitárias auxiliares.
- [x] Criar o componente `ShowCard.tsx` em `src/components/` e migrar a renderização do card de shows.
- [x] Criar o componente `BookCard.tsx` em `src/components/` e migrar a renderização do card de livros.
- [x] Criar o componente `CourseCard.tsx` em `src/components/` e migrar a renderização do card de cursos.
- [x] Criar os componentes de modais de shows (`AddShowModal.tsx`, `EditShowModal.tsx`, `ImportShowsModal.tsx`) em `src/components/`.
- [x] Criar os componentes de modais de livros (`AddBookModal.tsx`, `EditBookModal.tsx`) em `src/components/`.
- [x] Criar os componentes de modais de cursos (`AddCourseModal.tsx`, `EditCourseModal.tsx`) em `src/components/`.
- [x] Limpar e simplificar `src/app/page.tsx` para importar os novos componentes.
- [x] Criar testes unitários para as funções utilitárias em `src/utils/__tests__/helpers.test.tsx`.
- [x] Criar testes unitários para os componentes estruturais em `src/components/__tests__/`.
- [x] Verificar se toda a suite de testes passa executando `npm run test` e verificar se a build do Next.js compila perfeitamente com `npm run build`.
