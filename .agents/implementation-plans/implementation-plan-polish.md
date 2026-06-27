# Plano de Implementação - Ajustes, Polimento e Novas Funcionalidades (Manual Show & Filtro de Tipo)

Este plano detalha os ajustes finos de UI/UX e as novas funcionalidades para suporte a cadastro manual de shows e filtros de tipo (Filmes vs. Séries) na dashboard.

## User Review Required

> [!IMPORTANT]
> **Novas Funcionalidades de Shows (Filmes/Séries):**
> 1. **Cadastro Manual:** Adicionaremos o botão `＋ Adicionar Manual` ao lado do importador. O modal de Show passará a aceitar campos de texto editáveis para todos os metadados (Título, Tipo, Ano, Gênero, Diretor, Duração, País, Produtora), permitindo cadastrar itens que não estejam na API do OMDB ou corrigir dados importados.
> 2. **Filtro de Tipo na Dashboard:** Adicionaremos um novo combobox de filtro **"Tipo"** contendo as opções **"Todos"**, **"Filmes"** e **"Séries"** ao lado do combobox de ordenação na Dashboard, facilitando a navegação.

> [!IMPORTANT]
> **Alterações na Versão Desktop (Computador):**
> 1. **Fundo do Combobox:** O seletor de ordenação ("Ordenar por") passará a utilizar a classe customizada `SortSelect` baseada no estilo de formulários do layout (fundo escuro transparente e texto branco visível, incluindo fundo escuro nas opções).
> 2. **Filtro por Serviço:** A barra de pesquisa local de filmes/séries também filtrará pelo nome da plataforma (ex: digitar "Netflix" exibirá apenas os filmes/séries marcados nessa plataforma).
> 3. **Plataformas em Ordem Alfabética:** A lista de plataformas padrão será organizada em ordem alfabética:
>    - Apple TV+
>    - Crunchyroll
>    - Disney+
>    - F1 TV
>    - GloboPlay
>    - HBO Max
>    - Netflix
>    - Paramount+
>    - Prime Video
>    - Universal+
> 4. **Suporte a Nota 0:** Permitiremos que os shows, livros e cursos sejam salvos com nota `0` (indicando "Sem Avaliação" ou "Não assistido/lido"). Um botão "Sem nota" será adicionado ao lado das estrelas para permitir limpar a avaliação de volta para 0. Estrelas não avaliadas (0) serão renderizadas com estilo cinza/apagado.

> [!IMPORTANT]
> **Alterações na Versão Mobile (Celular):**
> 1. **Menu Hambúrguer no Header:** Em telas menores que 768px, o e-mail do usuário e o botão "Sair" serão recolhidos em um menu hambúrguer (`☰`). Ao clicar, abrirá um menu dropdown suspenso, evitando que o e-mail e o botão fiquem espremidos.
> 2. **Abas de Status em Mobile:** O container das abas de status (`Todos`, `Não Assistido`, etc.) terá rolagem horizontal automática em mobile (`overflow-x: auto`) com largura de botão fixa, garantindo que a aba "Assistido" fique acessível e não sofra corte.
> 3. **Alinhamento dos Filtros e Ordenação:** A seção de filtros (`FilterSection`) será empilhada verticalmente e centralizada em mobile, alinhando de forma perfeita a barra de busca, o filtro de tipo e o combobox de ordenação.

## Open Questions

Nenhuma questão em aberto pendente de aprovação. O fluxo proposto cobre a pesquisa em português permitindo ajuste de busca linha por linha se a tradução falhar na API do OMDB.

---

## Proposed Changes

### Configuration Layer

#### [MODIFY] [page.tsx](file:///c:/projects/web-tracker-all/src/app/page.tsx)

* **Cadastro Manual de Shows:**
  * Criar novos estados para os dados editáveis do show (`showTitle`, `showType`, `showYear`, `showGenre`, `showDirector`, `showRuntime`, `showProduction`, `showCountry`, `showPoster`, `isAddingShow`).
  * Adicionar o botão `＋ Adicionar Manual` ao lado do botão de importação.
  * No modal de Show (Adicionar/Editar), renderizar os campos de metadados como campos de entrada (inputs e selects) em vez de apenas spans estáticos.
  * Adaptar os métodos `handleSaveShow` e `handleUpdateShow` para usar os valores dos inputs do formulário em vez de ler diretamente do objeto do OMDB.

* **Filtro por Tipo de Show:**
  * Adicionar o estado local `typeFilter` (`'all' | 'movie' | 'series'`).
  * Adicionar o combobox correspondente na seção `<FilterSection>`.
  * Atualizar o filtro `filteredShows` para validar `show.type === typeFilter` caso o filtro não seja `'all'`.

* **Refatoração da Lista de Plataformas:**
  * Declarar uma constante global `STREAMING_PLATFORMS` em ordem alfabética.
  * Mapear esta constante para renderizar as opções de plataforma no modal de Adicionar, Editar e Importar.

* **Implementação da Nota 0:**
  * Modificar o estado inicial de nota (`rating`, `bookRating`, `courseRating`, `importGlobalRating`) de `3` para `0`.
  * Atualizar o utilitário `renderStars` para retornar estrelas com estilos de cor dinâmicos (cor amarela para as estrelas selecionadas, cor branca/cinza apagada para as estrelas não selecionadas).
  * Adicionar o botão "Sem nota" nos modais ao lado do selecionador de estrelas.

* **Ajuste de Estilos do Filtro e Ordenação:**
  * Atualizar `FilterSection` para alinhar os itens no centro em telas menores de 768px.
  * Criar o componente `SortSelect` (herdando de `Select`) com largura automática e `SortContainer` para acomodar a ordenação de forma organizada.
  * Adicionar rolagem horizontal no `TabList` e desabilitar encolhimento no `TabButton` (`flex-shrink: 0`).
  * Atualizar a largura do `LocalSearchInput` em mobile para ocupar `100%` com máximo de `320px`.
  * Incluir `show.platform.toLowerCase()` na verificação do filtro de pesquisa local para Shows.

* **Menu Hambúrguer Responsivo:**
  * Adicionar o estado local `menuOpen` (boolean).
  * Criar styled-components `MenuButton` (visível em mobile) e `MobileDropdownMenu`.
  * Ocultar os botões inline em mobile e exibir o menu retrátil.

---

## Verification Plan

### Automated Tests
* N/A

### Manual Verification
1. **Validação do Cadastro Manual de Shows:**
   - Clicar em "＋ Adicionar Manual".
   - Digitar os dados de um filme (Título, Gênero, Diretor, etc.) e clicar em Salvar.
   - Confirmar se o show é salvo no Firestore e aparece na Dashboard (usando poster de fallback `/file.svg`).
   - Tentar editar e alterar os dados salvos manualmente (ex: alterar o Diretor ou Duração) e verificar se atualiza.
2. **Validação do Filtro de Tipo:**
   - Na dashboard de Shows, alternar o filtro "Tipo" de "Todos" para "Filmes" e verificar se apenas filmes aparecem.
   - Alternar para "Séries" e verificar se apenas séries aparecem.
3. **Verificação Desktop:**
   - Validar se o combobox de ordenação possui o estilo `SortSelect` com fundo escuro.
   - Testar o filtro por nome da plataforma de streaming na busca local.
   - Verificar se a lista de plataformas nos selects está em ordem alfabética.
   - Validar suporte a nota 0 e botão "Sem nota".
4. **Verificação Mobile (Emulando viewport mobile):**
   - Validar menu hambúrguer, rolagem horizontal das abas de status, e centralização vertical dos filtros empilhados.
