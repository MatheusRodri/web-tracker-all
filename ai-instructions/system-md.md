# Tracker Shows

Esse projeto é responsável por gerenciar series e filmes não assistidos, assistindo e assistido, onde o usuário pode adicionar filmes e series do seu interesse e acompanhar o que já foi assistido. 

## Stack

- NextJs
- Firabase
- TypeScript
- Styled-components
- API OMDB

## Functional requirements

- O usuário pode fazer login com o e-mail e senha ou com Google
- O usuário pode adicionar filmes e series do seu interesse
- O usuário primeiro pesquisa pelo filme/serie na caixa de pesquisa, onde aparecerá uma lista com os filmes/series encontrados, após selecionar preeche informação de:
    - quantidade temporada (para series)
    - quantidade de ep (para series)
    - duração em minutos
    - produtoras
    - pais de origem
    - genero
    - diretor
- O usuário deve preecher os demais campos:
    - Status (Não Assistido, Assistindo, Assistido)
    - temporada atual (para series)
    - episodio atual (para series)
    - nota do filme/serie
    - Local do filme/serie (AppleTv, Netflix, Prime, HBO Max, Disney Plus, etc...)
    - Quantidade de vezes assistida
- Quando o usuário clica em um item da lista, abresse um modal com as informações do filme/serie, onde ele pode editar as informações. 
- O usuário pode remover um item da lista

## Non-functional requirements

- O sistema deve ser responsivo
- O sistema deve ter um layout moderno
- O sistema deve ter um layout intuitivo
- O sistema deve ter um layout acessível
- O sistema deve ter um layout performático
- O sistema deve ter um layout seguro