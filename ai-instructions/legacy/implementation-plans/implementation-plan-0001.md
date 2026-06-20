# Plano de Implementação - Tracker Shows

Criar um site completo, responsivo, performático e moderno para gerenciar séries e filmes (não assistido, assistindo e assistido). A aplicação usará Next.js (App Router), TypeScript, Styled-components, Firebase (Auth + Firestore) e integração com a API OMDB.

## User Review Required

> [!IMPORTANT]
> **Permissão para Arquivos de Configuração:**
> Para inicializar o projeto Next.js e configurar o styled-components e TypeScript, precisaremos criar e alterar arquivos de configuração (ex: `package.json`, `next.config.mjs`, `tsconfig.json`, `.eslintrc.json`, `rules.md`). Por favor, confirme se temos autorização para gerenciar e criar esses arquivos.

> [!WARNING]
> **Manipulação de Env:**
> Conforme a Regra 12 e 14, nunca leremos nem alteraremos o arquivo `.env`. Criaremos e gerenciaremos apenas o arquivo `[env.example](file:///c:/projects/web-tracker-shows/.env.example)`. Você precisará copiar este arquivo para `.env` e preencher com suas credenciais localmente.

## Open Questions

> [!IMPORTANT]
> 1. **Chave da API OMDB:**
>    Você já possui uma chave de API do OMDB ou devemos configurar a variável no `.env.example` como `OMDB_API_KEY` para que você possa inseri-la depois?
> 2. **Configurações do Firebase:**
>    Podemos estruturar o arquivo `.env.example` com os campos padrões do Firebase client SDK? (Ex: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.).
> 3. **Design e Paleta de Cores:**
>    Nossa recomendação é usar um tema escuro moderno inspirado em plataformas de streaming (Netflix/HBO/AppleTV), com tons escuros profundos (#0F0F12), cartões com glassmorphism (efeito vidro fosco) e acentos em cores neon suaves (como Violeta Neon e Ciano). Você concorda com essa linha visual?

---

## Proposed Changes

### [Bootstrap & Configuração]

#### [NEW] [env.example](file:///c:/projects/web-tracker-shows/.env.example)
Criação do template de variáveis de ambiente.

#### [NEW] [registry.tsx](file:///c:/projects/web-tracker-shows/src/lib/registry.tsx)
Style registry necessário para evitar flash de conteúdo não estilizado (FOUC) ao usar styled-components com Next.js App Router.

---

### [Integração & Serviços]

#### [NEW] [firebase.ts](file:///c:/projects/web-tracker-shows/src/lib/firebase.ts)
Inicialização do Firebase Client SDK (Auth e Firestore).

#### [NEW] [route.ts](file:///c:/projects/web-tracker-shows/src/app/api/search/route.ts)
Rota de API segura do Next.js para consultar a API OMDB usando a chave configurada no servidor, prevenindo vazamento da chave no frontend.

---

### [Autenticação & Interface]

#### [NEW] [layout.tsx](file:///c:/projects/web-tracker-shows/src/app/layout.tsx)
Layout raiz integrado com o styled-components registry e provedor de autenticação.

#### [NEW] [page.tsx](file:///c:/projects/web-tracker-shows/src/app/page.tsx)
Página principal que atuará como roteadora (direciona para Login ou para Dashboard dependendo do estado de login do usuário).

#### [NEW] [login-page](file:///c:/projects/web-tracker-shows/src/app/login/page.tsx)
Interface e lógica de login/cadastro com e-mail/senha ou Google.

---

## Verification Plan

### Automated Tests
- Testaremos o build do projeto rodando `npm run build` para garantir que o TypeScript e o Next.js estão configurados sem erros.

### Manual Verification
- Inicializar o servidor com `npm run dev`.
- Verificar renderização inicial e injeção do Styled-components no HTML (sem FOUC).
- Verificar busca da API OMDB chamando a rota `/api/search` localmente.
- Validar login e gravação no Firestore simulando as credenciais no `.env`.
