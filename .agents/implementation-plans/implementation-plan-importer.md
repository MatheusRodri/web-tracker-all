# Plano de Implementação - Ajuste de Inputs, Importador de Filmes (com suporte a CSV) e Ordem Cronológica

Este plano descreve como corrigiremos os limites nos campos de contadores numéricos (que não permitem `0`), como implementaremos um importador em lote (bulk importer) para arquivos CSV ou listas de texto, e como adicionaremos o recurso de **Ordem Cronológica** de visualização para organizar franquias de filmes/séries.

## User Review Required

> [!IMPORTANT]
> **Ordem Cronológica / Sequência de Visualização:**
> * Adicionaremos um novo campo opcional `watchOrder` (número) nos Shows (Filmes/Séries).
> * O usuário poderá digitar a ordem cronológica desejada (ex: `1`, `2`, `3`) no formulário de cadastro e edição de shows.
> * Um badge com o número (ex: `#1`) aparecerá no canto superior esquerdo do card de cada filme que possuir uma ordem definida.
> * Adicionaremos uma opção de ordenação na Dashboard: **"Ordem Cronológica"**, que ordenará os filmes baseando-se nesse campo de forma crescente (e depois por data de criação).

> [!IMPORTANT]
> **Ajuste de Comportamento dos Contadores:**
> Os campos "Quantidade de vezes assistida", "Vezes Lido" e "Vezes Completado" passarão a aceitar o valor `0`.
> Ao adicionar um item com status "Não assistido" / "Quero ler" / "Quero iniciar", o contador correspondente será inicializado em `0`.

> [!TIP]
> **Como funcionará o Importador de Filmes (Texto + CSV):**
> 1. Um botão "Importar Lista" será adicionado ao lado da barra de busca de Filmes/Séries.
> 2. O usuário terá duas abas no modal:
>    - **Aba Texto:** Onde cola uma lista de nomes de filmes (um por linha).
>    - **Aba CSV:** Onde faz upload de um arquivo `.csv`. O sistema detectará automaticamente as colunas de título/nome, ordem cronológica, status, plataforma, nota e vezes assistido.
> 3. O sistema buscará cada filme na API do OMDB e trará o melhor resultado correspondente.
> 4. O usuário poderá revisar cada filme encontrado, alterar o termo de busca para buscar o título em inglês caso o resultado esteja incorreto, ajustar o status individual (ou global), plataforma, nota, e **especificar a ordem cronológica de cada linha antes de importar**.

## Open Questions

Nenhuma questão em aberto pendente de aprovação. O fluxo proposto cobre a pesquisa em português permitindo ajuste de busca linha por linha se a tradução falhar na API do OMDB.

---

## Proposed Changes

### Database Layer

#### [MODIFY] [firestore.ts](file:///c:/projects/web-tracker-all/src/lib/firestore.ts)
* Atualizar a interface `TrackedShow` para incluir o campo opcional `watchOrder?: number | null;`.

### Dashboard Component

#### [MODIFY] [page.tsx](file:///c:/projects/web-tracker-all/src/app/page.tsx)

* **Novo Estado de Ordenação e Campos:**
  * Adicionar estado `sortBy` para controlar a ordenação dos shows (`'recent' | 'watchOrder' | 'rating' | 'title'`).
  * Adicionar estado `watchOrder` para controlar o valor do campo no modal de adicionar/editar.
  * Adicionar componente `OrderBadge` posicionado de forma absoluta sobre o card.
  * Atualizar o renderizador de cards para exibir a ordem (ex: `#1`).

* **Correção de Validação de Input Numérico:**
  * Alterar o valor mínimo de `1` para `0` nos inputs de `timesWatched`, `bookTimesRead` e `courseTimesCompleted`.
  * Alterar os parsers `onChange` de `parseInt(...) || 1` para `Math.max(0, parseInt(...) || 0)` para que o usuário possa digitar `0` livremente ou apagar o input para digitar `0`.
  * Atualizar o comportamento da interface para que, ao definir o status como "Não assistido" / "Não lido" / "Planejado", os contadores sejam ajustados para `0` por padrão. Se definidos como "Concluídos/Vistos", sejam ajustados para pelo menos `1` caso estivessem em `0`.

* **Novos Campos nos Modais de Show:**
  * Adicionar input de "Ordem Cronológica" nos formulários de cadastro e edição de show.

* **Seletor de Ordenação na Dashboard:**
  * Adicionar um componente `<Select>` para ordenação na barra de filtros da dashboard (quando a aba ativa for `shows`).

* **Botão de Importação:**
  * Adicionar um botão `📥 Importar Lista` próximo ao campo de busca de shows.

* **Modal de Importação em Lote:**
  * Implementar novos estados para o fluxo de importação (`isImportingShows`, `importRawList`, `importStep`, `importItems`, etc.).
  * **Etapa 1: Entrada de Títulos (Texto / Upload de CSV) & Padrões Globais**
    * Aba Texto: Textarea para colar títulos de filmes (um por linha).
    * Aba CSV: Área de upload para carregar um arquivo `.csv`. O parser processará o arquivo e buscará mapear colunas como "título", "nome", "status", "plataforma", "nota/rating", "ordem/posição" e "vezes assistido".
    * Seletores padrão para Status, Plataforma, Nota e Vezes Assistido que serão aplicados a todos os itens por padrão caso não definidos na linha do CSV.
  * **Etapa 2: Resolução de Correspondência**
    * Processa a lista e busca na API do OMDB (via `/api/search?s=`).
    * Exibe uma tabela interativa de resultados.
    * Permite pesquisa manual individual (útil caso o título em português não retorne o filme correto na API).
    * Permite exclusão de linhas individuais e alteração pontual de atributos (plataforma, status, nota, ordem cronológica).
  * **Etapa 3: Progresso e Finalização**
    * Faz chamadas detalhadas para `/api/search?i=` para cada filme aprovado para coletar todos os metadados (gênero, diretor, etc.) e salva no Firestore utilizando o método `addShow`.
    * Exibe barra de progresso em tempo real.
    * Exibe mensagem de sucesso ao finalizar e atualiza a listagem de shows na dashboard.

---

## Verification Plan

### Automated Tests
* N/A - O projeto não possui suite de testes automatizados configurada. Focaremos na validação manual.

### Manual Verification
1. **Validação do Bug do '1':**
   - Abrir o modal de adicionar ou editar um show.
   - Tentar apagar o valor do input "Quantidade de vezes assistida" e digitar `0`. Verificar se o campo aceita `0`.
   - Adicionar o item e confirmar se ele é salvo no banco de dados com `timesWatched: 0`.
   - Mudar o status para "Unwatched" e verificar se o valor muda automaticamente para `0`.
   - Fazer o mesmo para Livros e Cursos.
2. **Validação da Ordem Cronológica:**
   - Adicionar dois filmes definindo a ordem como `1` e `2`.
   - Verificar se os badges `#1` e `#2` aparecem sobre a capa correspondente.
   - Testar mudar a ordenação da dashboard de "Mais Recentes" para "Ordem Cronológica" e ver se eles são reordenados adequadamente.
3. **Validação do Importador de Filmes (Texto):**
   - Clicar em "Importar Lista".
   - Colar uma lista mista (Matrix, Interestelar, etc.) na aba de texto.
   - Confirmar se resolve e importa normalmente.
4. **Validação do Importador de Filmes (CSV):**
   - Criar um arquivo CSV de teste com colunas como: `titulo, status, plataforma, nota, ordem`.
   - Preencher com alguns títulos em português e ordens numéricas (ex: `1`, `2`, `3`).
   - Fazer upload na aba CSV.
   - Verificar se o parser extrai corretamente os dados (incluindo a ordem) e os exibe para confirmação.
   - Testar o campo de busca manual em uma linha (ex: mudar "A Origem" para "Inception" e clicar em Buscar).
   - Confirmar a importação e verificar se a barra de progresso funciona.
   - Verificar se os filmes aparecem no painel principal com os metadados corretos (Poster, Diretor, Ano, Gênero, Ordem).
