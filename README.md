# Biblioteca Online

SPA do Capstone universitário para explorar o catálogo público e gerenciar o acervo físico. A interface segue os frames Desktop, Mobile e UX/UI do Figma, consulta a Open Library e usa Supabase para autenticação e persistência multiusuário.

## Executar

```bash
npm install
cp .env.example .env.local
npm run dev
```

O Vite aceita `.env` ou `.env.local`; o repositório ignora ambos. Nunca versione o arquivo preenchido.

Variáveis esperadas:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Somente a chave pública/publishable deve ser usada no frontend.

## Rotas desta etapa

- `/` — página inicial
- `/catalogo` — catálogo público
- `/livros/:bookId` — detalhes do livro
- `/entrar` — autenticação institucional
- `/cadastro` — criação de conta institucional
- `/recuperar-senha` e `/recuperar-senha/nova` — solicitação e definição de nova senha
- `/minha-conta` — painel do aluno protegido
- `/minha-conta/emprestimos`, `/reservas`, `/desejos`, `/leituras` e `/perfil` — área do aluno
- `/admin` — painel administrativo protegido por papel de acesso
- `/admin/acervo`, `/exemplares`, `/emprestimos`, `/reservas`, `/estudantes`, `/relatorios` e `/configuracoes` — gestão administrativa

## Autenticação

O Supabase Auth executa o login por e-mail e senha. O cliente oficial mantém a sessão no armazenamento do navegador, renova o access token e inclui a autenticação nas chamadas ao Supabase. O `AuthProvider` restaura a sessão ao abrir a aplicação e acompanha login/logout em tempo real. Para endpoints REST próprios, `authenticatedFetch` adiciona explicitamente `Authorization: Bearer <token>`.

No painel do Supabase, cadastre as URLs local e pública em **Authentication → URL Configuration**. Nunca coloque a `service_role` no frontend: use apenas a chave pública/publishable.

### Fluxo de integração e autenticação

1. Cadastro, login, recuperação e alteração de senha usam diretamente o Supabase Auth.
2. Após o login, o SDK persiste a sessão no navegador e renova o access token automaticamente.
3. O `AuthProvider` restaura a sessão na inicialização e acompanha as mudanças emitidas por `onAuthStateChange`.
4. O `ProtectedRoute` impede acesso anônimo, preserva a rota de retorno e exige `role: "admin"` para a área administrativa.
5. Requisições para endpoints REST protegidos podem usar `authenticatedFetch`, que obtém a sessão atual e envia `Authorization: Bearer <token>`.
6. O logout chama o backend do Supabase, encerra a sessão local e devolve o usuário à área pública.

O catálogo é uma segunda integração REST: `src/services/openLibrary.ts` consulta a Open Library por meio de `fetch`, trata respostas HTTP e converte os dados externos para o domínio tipado da aplicação.

## Testes

```bash
npm test
npm run test:coverage
npm run typecheck
npm run build
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

## Ativação do acervo interno

A migration [supabase/migrations/20261015090000_library_core.sql](supabase/migrations/20261015090000_library_core.sql) cria perfis, obras incorporadas, exemplares, empréstimos, reservas, estados de leitura, desejos, políticas RLS e funções transacionais. Ela não foi aplicada remotamente por este trabalho.

Após revisão e autorização:

1. Execute a migration no projeto Supabase de desenvolvimento.
2. Confirme as políticas institucionais em `library_settings` (prazo, limite e renovações).
3. Defina administradores em `app_metadata.role = "admin"` usando ambiente seguro.
4. Entre em `/admin/acervo`, incorpore uma obra pelo ID `OL...W` da Open Library e cadastre seus exemplares.
5. Valide empréstimo, reserva, renovação e devolução com duas contas de teste.

As funções RPC bloqueiam a cópia durante o empréstimo, respeitam a fila de reservas e evitam dupla circulação. O frontend nunca grava automaticamente todos os resultados da Open Library no acervo.

## Funcionalidades

- catálogo público, detalhes, paginação, categoria, idioma e ordenação por publicação, autor e popularidade;
- disponibilidade física consultada separadamente no Supabase;
- cadastro, login, recuperação, sessão e logout reais;
- empréstimos, prazos, histórico, renovação, reservas e cancelamento;
- leitura (`Lendo` e `Concluído`) e lista de desejos persistentes;
- administração de obras, exemplares, devoluções, fila, estudantes, indicadores e políticas;
- estados de carregamento, vazio e erro, layout responsivo e navegação por teclado.

A popularidade usa `edition_count`/ordenação por número de edições da Open Library; não é um valor inventado nem representa popularidade dentro da universidade. A ordenação alfabética por autor é aplicada aos resultados da página retornada pela API.

## Limitações conhecidas

- Enquanto a migration não for aplicada, telas internas exibem um aviso honesto e não simulam registros.
- Notificação quando um item desejado fica disponível foi retirada do escopo por decisão do projeto.
- A implantação pública ainda não foi executada.
- Uma auditoria automatizada WCAG dedicada ainda é recomendada antes da entrega final.

Para liberar um administrador, defina `app_metadata.role` como `admin` por um ambiente seguro (Edge Function ou servidor com chave privilegiada). Nunca permita que o próprio navegador atribua esse papel. A checagem de rota melhora a experiência, mas a autorização real também deve existir nas políticas RLS.

Consulte também [requisitos](docs/REQUIREMENTS.md), [arquitetura](docs/ARCHITECTURE.md) e [matriz de conformidade](docs/IMPLEMENTATION_STATUS.md).

## Tema visual

O alternador no cabeçalho escolhe entre os modos claro e noturno e salva a preferência no navegador. Sem uma escolha anterior, o tema inicial é claro, conforme o Figma.

As telas devem usar os tokens semânticos do Tailwind (`surface`, `canvas`, `ink`, `muted`, `line`, `primary` e seus derivados), definidos em `src/index.css` e `tailwind.config.js`. Isso permite que componentes novos funcionem nos dois temas sem manter CSS separado por dispositivo ou duplicar componentes.
