# Refatoração da Dashboard (page.tsx) e Criação de Testes (Com Jest)

Refatorar o arquivo [page.tsx](file:///c:/projects/web-tracker-all/src/app/page.tsx) (atualmente com mais de 4.000 linhas) extraindo componentes reutilizáveis, funções auxiliares e estilos em arquivos separados, além de configurar uma infraestrutura de testes unitários com Jest e jsdom.

## Decisões de Design (Aprovadas)

- **Test Runner**: Jest
- **Environment**: jsdom (simula o DOM do navegador em Node.js para testar componentes React)

## Proposed Changes

### 1. Extração de Estilos e Helpers
Separar estilos de styled-components e funções globais para diminuir o tamanho de `page.tsx`.

#### [NEW] [styles.ts](file:///c:/projects/web-tracker-all/src/app/styles.ts)
- Contém todos os styled-components definidos no início de `page.tsx`.

#### [NEW] [helpers.ts](file:///c:/projects/web-tracker-all/src/utils/helpers.ts)
- Funções utilitárias como `renderStars` e definições de plataformas (`STREAMING_PLATFORMS`, `BOOK_FORMATS`, etc.).

---

### 2. Criação de Componentes Separados
Criar componentes focados e tipados.

#### [NEW] [ShowCard.tsx](file:///c:/projects/web-tracker-all/src/components/ShowCard.tsx)
- Card individual de shows (filmes/séries) com seu badge de ordem cronológica e barra de progresso.

#### [NEW] [BookCard.tsx](file:///c:/projects/web-tracker-all/src/components/BookCard.tsx)
- Card individual de livros com progresso de leitura.

#### [NEW] [CourseCard.tsx](file:///c:/projects/web-tracker-all/src/components/CourseCard.tsx)
- Card de cursos com progresso de conclusão.

#### [NEW] [ShowModals.tsx](file:///c:/projects/web-tracker-all/src/components/ShowModals.tsx)
- Modais de adicionar manual, editar e importar shows.

#### [NEW] [BookModals.tsx](file:///c:/projects/web-tracker-all/src/components/BookModals.tsx)
- Modais de adicionar e editar livros.

#### [NEW] [CourseModals.tsx](file:///c:/projects/web-tracker-all/src/components/CourseModals.tsx)
- Modais de adicionar e editar cursos.

---

### 3. Ajuste do page.tsx
#### [MODIFY] [page.tsx](file:///c:/projects/web-tracker-all/src/app/page.tsx)
- Limpeza dos componentes, modais e estilos extraídos, mantendo apenas os hooks de estado e a lógica central da dashboard.

---

### 4. Configuração e Criação de Testes
#### [MODIFY] [package.json](file:///c:/projects/web-tracker-all/package.json)
- Adição dos scripts de teste e dependências (`jest`, `@testing-library/react`, `@testing-library/jest-dom`, `ts-jest`, `@types/jest`, `jest-environment-jsdom`).

#### [NEW] [jest.config.js](file:///c:/projects/web-tracker-all/jest.config.js)
- Configuração do ambiente Jest com jsdom e ts-jest.

#### [NEW] [ShowCard.test.tsx](file:///c:/projects/web-tracker-all/src/components/__tests__/ShowCard.test.tsx)
- Testes unitários para garantir o comportamento correto do card de shows.

#### [NEW] [helpers.test.ts](file:///c:/projects/web-tracker-all/src/utils/__tests__/helpers.test.ts)
- Testes unitários para as funções auxiliares.

## Verification Plan

### Automated Tests
- Execução do comando `npm run test` (ou `npx jest`) após a configuração para rodar todos os testes unitários criados.
- Execução de `npm run build` para garantir que o Next.js constrói a aplicação sem erros de compilação ou tipos.

### Manual Verification
- Acesso à dashboard local e validação das transições de abas, filtros e abertura dos modais para garantir que a refatoração não quebrou nenhuma funcionalidade.
