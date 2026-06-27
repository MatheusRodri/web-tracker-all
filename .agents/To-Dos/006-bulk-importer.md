# TODO 006: Importador de Filmes em Lote (Texto + CSV)

- [ ] Adicionar botão `📥 Importar Lista` próximo ao campo de busca de shows na dashboard.
- [ ] Implementar os estados do fluxo de importação no componente `Home` em `src/app/page.tsx` (`isImportingShows`, `importRawList`, `importStep`, `importItems`, etc.).
- [ ] Desenhar a Etapa 1 do modal: Abas para colar lista de texto (títulos linha por linha) ou carregar arquivo CSV, juntamente com inputs para valores padrão de importação (Status, Plataforma, Nota, Vezes Assistido).
- [ ] Implementar a lógica de leitura de arquivos CSV no cliente (separando por quebras de linha e vírgulas/ponto-e-vírgula) e mapear as colunas por nome de cabeçalho inteligente (título, ordem cronológica, plataforma, status, nota).
- [ ] Desenhar a Etapa 2 do modal (Resolução de correspondências):
  - Iterar sobre a lista importada e buscar resultados preliminares na API `/api/search?s=`.
  - Exibir a tabela de itens originais, busca correspondente com miniatura do poster, e seletores de status/plataforma/nota/ordem individuais.
  - Implementar caixa de busca em cada linha para re-pesquisar itens individuais manualmente (caso a tradução em português falhe e requeira o título em inglês).
- [ ] Desenhar a Etapa 3 do modal (Progresso e Finalização):
  - Ao confirmar, realizar a busca detalhada via `/api/search?i=` para buscar metadados completos de cada item aprovado.
  - Salvar no Firestore sequencialmente chamando `addShow`.
  - Exibir barra de progresso em tempo real e mensagem de conclusão.
- [ ] Testar exaustivamente a importação tanto por texto colado quanto por arquivo CSV de teste.
