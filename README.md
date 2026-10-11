# Biblioteca Online

Base frontend do Capstone universitário, implementada a partir dos frames Desktop, Mobile e UX/UI do Figma.

## Executar

```bash
npm install
cp .env.example .env.local
npm run dev
```

Variáveis esperadas:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Somente a chave pública/publishable deve ser usada no frontend.

## Rotas desta etapa

- `/` — página inicial
- `/catalogo` — catálogo público
- `/livros/:bookId` — detalhes do livro
- `/entrar` — autenticação institucional
- `/minha-conta` — área protegida (redireciona visitantes para o login)

## Autenticação

O Supabase Auth executa o login por e-mail e senha. O cliente oficial mantém a sessão no armazenamento do navegador, renova o access token e inclui a autenticação nas chamadas ao Supabase. O `AuthProvider` restaura a sessão ao abrir a aplicação e acompanha login/logout em tempo real. Para endpoints REST próprios, `authenticatedFetch` adiciona explicitamente `Authorization: Bearer <token>`.

No painel do Supabase, cadastre as URLs local e pública em **Authentication → URL Configuration**. Nunca coloque a `service_role` no frontend: use apenas a chave pública/publishable.

### Fluxo de integração e autenticação

1. O formulário de `/entrar` envia e-mail e senha para `signInWithPassword`, que delega a validação ao Supabase Auth.
2. Após o login, o SDK persiste a sessão no navegador e renova o access token automaticamente.
3. O `AuthProvider` restaura a sessão na inicialização e acompanha as mudanças emitidas por `onAuthStateChange`.
4. O `ProtectedRoute` impede o acesso anônimo a `/minha-conta` e preserva a rota de retorno para depois do login.
5. Requisições para endpoints REST protegidos podem usar `authenticatedFetch`, que obtém a sessão atual e envia `Authorization: Bearer <token>`.
6. O logout chama o backend do Supabase, encerra a sessão local e devolve o usuário à área pública.

O catálogo é uma segunda integração REST: `src/services/openLibrary.ts` consulta a Open Library por meio de `fetch`, trata respostas HTTP e converte os dados externos para o domínio tipado da aplicação.

## Testes

```bash
npm test
npm run test:coverage
```

A suíte usa Jest e React Testing Library. Ela cobre componentes críticos, o hook de tema, login/logout, envio do token e integração com a Open Library por meio de mocks de `fetch`.

Componentes cobertos diretamente:

- `SearchBar`: submissão, normalização e navegação da pesquisa.
- `BookCard`: apresentação dos dados e navegação para detalhes.
- `LoginPage`: envio das credenciais, redirecionamento e mensagens de erro.
- Hook `useTheme`: alternância, persistência e uso obrigatório do provider.

Os testes de integração simulam o Supabase e o `fetch` da Open Library, portanto não dependem de rede nem de credenciais reais para executar.

## Produção (Vercel)

1. Importe o repositório na Vercel.
2. Selecione a branch `main` como branch de produção e o preset **Vite**.
3. Cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nas variáveis do projeto.
4. Confirme `npm run build` como comando de build e `dist` como diretório de saída.
5. Publique e adicione a URL fornecida pela Vercel às URLs permitidas no Supabase Auth.

O `vercel.json` já registra o build, o diretório `dist` e o fallback necessário para abrir diretamente as rotas da SPA, como `/entrar` e `/minha-conta`.

Antes de publicar, execute `npm run test:coverage && npm run build`.

## Dados

O catálogo e os detalhes consultam a Open Library em tempo real. Disponibilidade e exemplares físicos continuam em mocks tipados em `src/mocks/books.ts`, vinculados por `openLibraryKey`; uma obra externa sem vínculo aparece como “Só no catálogo”. Esses domínios permanecem separados e nenhum resultado da Open Library é gravado automaticamente no Supabase.

## Tema visual

O alternador no cabeçalho escolhe entre os modos claro e noturno e salva a preferência no navegador. Sem uma escolha anterior, o tema inicial acompanha a preferência do sistema operacional.

As telas devem usar os tokens semânticos do Tailwind (`surface`, `canvas`, `ink`, `muted`, `line`, `primary` e seus derivados), definidos em `src/index.css` e `tailwind.config.js`. Isso permite que componentes novos funcionem nos dois temas sem manter CSS separado por dispositivo ou duplicar componentes.
