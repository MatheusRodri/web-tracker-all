# TODO 001: Modelagem e CRUD do Firestore para Livros e Cursos

- [ ] Definir interfaces TypeScript `TrackedBook` e `TrackedCourse` em `src/lib/firestore.ts` com os campos acordados em inglês.
- [ ] Implementar funções de escrita e escuta em tempo real para a coleção `books` no Firestore (`addBook`, `updateBook`, `deleteBook`, `subscribeToBooks`).
- [ ] Implementar funções de escrita e escuta em tempo real para a coleção `courses` no Firestore (`addCourse`, `updateCourse`, `deleteCourse`, `subscribeToCourses`).
- [ ] Testar build (`npm run build`) para verificar a integridade da tipagem TypeScript.
