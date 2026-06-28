# TODO 007: Refatoração do page.tsx e Setup de Testes

- [ ] Instalar dependências de teste (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) no `package.json` (após aprovação do plano de implementação).
- [ ] Criar arquivo de configuração `vitest.config.ts`.
- [ ] Criar o arquivo `src/app/styles.ts` contendo todos os componentes de estilo (`styled-components`) extraídos de `page.tsx`.
- [ ] Criar o arquivo `src/utils/helpers.ts` contendo constantes globais e funções utilitárias auxiliares.
- [ ] Criar o componente `ShowCard.tsx` em `src/components/` e migrar a renderização do card de shows.
- [ ] Criar o componente `BookCard.tsx` em `src/components/` e migrar a renderização do card de livros.
- [ ] Criar o componente `CourseCard.tsx` in `src/components/` e migrar a renderização do card de cursos.
- [ ] Criar o componente `ShowModals.tsx` em `src/components/` e migrar os modais de shows (Adicionar, Editar e Importar).
- [ ] Criar o componente `BookModals.tsx` em `src/components/` e migrar os modais de livros.
- [ ] Criar o componente `CourseModals.tsx` em `src/components/` e migrar os modais de cursos.
- [ ] Limpar e simplificar `src/app/page.tsx` para importar os novos componentes.
- [ ] Criar testes unitários para as funções utilitárias em `src/utils/__tests__/helpers.test.ts`.
- [ ] Criar testes unitários para os componentes estruturais em `src/components/__tests__/`.
- [ ] Verificar se toda a suite de testes passa executando `npm run test` e verificar se a build do Next.js compila perfeitamente com `npm run build`.
