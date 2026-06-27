# TODO 005: Campo de Ordem Cronológica para Shows

- [ ] Atualizar a interface `TrackedShow` em `src/lib/firestore.ts` para incluir o campo opcional `watchOrder?: number | null;`.
- [ ] Adicionar um campo de input numérico "Ordem Cronológica (Opcional)" nos modais de adicionar e editar shows em `src/app/page.tsx`.
- [ ] Renderizar um badge com a ordem correspondente (ex: `#1`) de forma absoluta no canto superior esquerdo do card do show, caso o valor esteja presente.
- [ ] Adicionar um seletor dropdown na barra de filtros da dashboard para ordenação (por recentes, por ordem cronológica crescente, por nota, por título).
- [ ] Testar a ordenação na listagem de shows com itens que possuem e não possuem `watchOrder`.
