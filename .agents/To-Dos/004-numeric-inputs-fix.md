# TODO 004: Correção dos Inputs Numéricos (Bug do valor 1)

- [ ] Ajustar valor mínimo de `1` para `0` nos inputs de `timesWatched`, `bookTimesRead` e `courseTimesCompleted` em `src/app/page.tsx`.
- [ ] Alterar o parser nos manipuladores `onChange` de `parseInt(...) || 1` para `Math.max(0, parseInt(...) || 0)` nesses campos numéricos para permitir a entrada de `0` ou exclusão temporária para digitação.
- [ ] Implementar ajuste automático nos formulários: ao selecionar status de "Não visto / Não lido / Não iniciado", mudar o respectivo contador para `0`. Ao selecionar status de "Concluído / Visto / Lido", garantir que o valor seja pelo menos `1` (caso estivesse em `0`).
- [ ] Testar manualmente na interface se a gravação e a alteração funcionam corretamente, salvando o valor `0` no Firestore.
