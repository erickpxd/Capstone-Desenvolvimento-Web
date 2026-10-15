# Arquitetura

## Fronteiras de dados

1. A Open Library é consultada por `services/openLibrary.ts` e convertida para o tipo interno `Book`.
2. O Supabase Auth mantém a sessão real do usuário.
3. O PostgreSQL/Supabase mantém acervo, exemplares, empréstimos, reservas, leituras e desejos. RLS limita cada estudante aos próprios dados.
4. Uma obra só integra o acervo depois de uma ação administrativa explícita. Resultados públicos nunca são importados automaticamente.

## Fluxo de circulação

O frontend chama funções RPC transacionais. `borrow_book` bloqueia e seleciona uma cópia disponível, verifica o limite configurado e cria o empréstimo. `reserve_book` só aceita reserva quando não há cópia disponível. `renew_loan` verifica limites e fila. `return_loan` encerra o empréstimo e libera a cópia. Assim, duas abas ou usuários não conseguem emprestar o mesmo exemplar.

## Organização

- `features/*`: páginas e composição por domínio.
- `components/*`: elementos compartilhados.
- `services/openLibrary.ts`: adaptação da API bibliográfica.
- `services/library.ts`: consultas e comandos do acervo interno.
- `types/*`: contratos da aplicação.
- `supabase/migrations/*`: esquema, funções e políticas versionadas.

TanStack Query mantém cache e invalida dados após mutações. React Context fica responsável pela sessão e tema; estado local de formulários permanece no componente. O projeto preserva Tailwind e Jest já instalados em vez de trocar ferramentas funcionais.

## Segurança

A chave publishable é pública por definição e só autoriza o que as políticas RLS permitem. Administração exige `auth.jwt()->'app_metadata'->>'role' = 'admin'`. A chave `service_role` nunca deve chegar ao frontend. A migration precisa ser revisada e aplicada no Supabase separadamente; este repositório não a executa remotamente.
