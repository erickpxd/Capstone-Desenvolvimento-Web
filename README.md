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

## Dados

O catálogo e os detalhes consultam a Open Library em tempo real. Disponibilidade e exemplares físicos continuam em mocks tipados em `src/mocks/books.ts`, vinculados por `openLibraryKey`; uma obra externa sem vínculo aparece como “Só no catálogo”. Esses domínios permanecem separados e nenhum resultado da Open Library é gravado automaticamente no Supabase.

## Tema visual

O alternador no cabeçalho escolhe entre os modos claro e noturno e salva a preferência no navegador. Sem uma escolha anterior, o tema inicial acompanha a preferência do sistema operacional.

As telas devem usar os tokens semânticos do Tailwind (`surface`, `canvas`, `ink`, `muted`, `line`, `primary` e seus derivados), definidos em `src/index.css` e `tailwind.config.js`. Isso permite que componentes novos funcionem nos dois temas sem manter CSS separado por dispositivo ou duplicar componentes.
