# Plano de Implementação - Tracker All

Realizar a transição do escopo da aplicação de um "Tracker de Shows" (filmes e séries) para um "Tracker All", permitindo que o usuário gerencie e acompanhe o progresso de **Shows** (Filmes e Séries), **Livros** e **Cursos** em abas separadas, integrados com o Firebase (Auth + Firestore) e a API OMDB.

## User Review Required

> [!IMPORTANT]
> **Reorganização de Instruções (Legado):**
> Movemos todos os arquivos e pastas gerados na etapa anterior dentro de `ai-instructions/` para uma pasta de legado `ai-instructions/legacy/`, exceto as regras de desenvolvimento que permanecerão ativas na raiz de `ai-instructions/rules.md`.

> [!WARNING]
> **Banco de Dados (Firestore):**
> A inclusão de Livros e Cursos exigirá novas coleções ou expansão no Firestore. Recomenda-se criar coleções separadas para facilitar regras de validação do banco.

## Open Questions

> [!IMPORTANT]
> 1. **APIs de Busca para Livros e Cursos:**
>    Gostaria de integrar alguma API externa de busca para Livros (como Google Books ou Open Library) ou a inserção para Livros e Cursos deverá ser 100% manual? *Recomendamos que para Cursos e Livros a inserção seja manual e simplificada nesta primeira etapa.*
> 2. **Valores de Status em Inglês:**
>    Para mantermos a padronização das tabelas em inglês (conforme solicitado anteriormente), sugerimos os seguintes estados:
>    - **Livros:** `PlanToRead` (Quero Ler), `Reading` (Lendo), `Read` (Lido).
>    - **Cursos:** `PlanToStart` (Quero Começar), `Studying` (Estudando), `Completed` (Concluído).
>    Você concorda com estes valores?
> 3. **Estrutura de Coleções:**
>    Podemos estruturar o Firestore em 3 coleções distintas: `shows`, `books` e `courses`? Esta abordagem mantém as chaves limpas e seguras.

---

## Proposed Changes

### [Reorganização da Pasta ai-instructions]

#### [NEW] [legacy](file:///c:/projects/web-tracker-all/ai-instructions/legacy)
Diretório legado contendo todo o histórico do projeto antigo "Tracker Shows".

#### [MODIFY] [system.md](file:///c:/projects/web-tracker-all/ai-instructions/system.md)
Atualização dos requisitos funcionais do sistema para abranger Shows, Livros e Cursos.

---

### [Arquitetura & Firestore]

#### [NEW] [books-courses-models](file:///c:/projects/web-tracker-all/src/lib/firestore.ts)
Modificar `src/lib/firestore.ts` para adicionar tipos TypeScript e funções CRUD para as coleções de livros (`books`) e cursos (`courses`).

---

### [Interface do Dashboard]

#### [MODIFY] [page.tsx](file:///c:/projects/web-tracker-all/src/app/page.tsx)
Modificar a tela principal do Dashboard:
- Adicionar abas de navegação na parte superior (ou lateral) para selecionar a categoria ativa: **Shows**, **Livros** ou **Cursos**.
- Implementar formulários específicos de cadastro e edição para cada tipo de item.
- Exibir grids específicos com metadados corretos para cada categoria (páginas de livros, horas de cursos, etc.).

---

## Verification Plan

### Automated Tests
- Executaremos `npm run build` para garantir a integridade das tipagens TypeScript do Firestore e renderização dos novos componentes.

### Manual Verification
- Testar a navegação entre as 3 abas principais.
- Testar o CRUD completo (criar, ler, editar, deletar) para as novas abas (Livros e Cursos) verificando se os registros estão sendo isolados e salvos corretamente em suas coleções no Firestore.
