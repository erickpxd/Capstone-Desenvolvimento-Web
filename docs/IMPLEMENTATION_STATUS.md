# Matriz de conformidade

Atualizada em 19/10/2026. “Concluído” exige código e evidência verificável; a ativação do banco remoto é registrada separadamente. A lista de desejos é opcional e não bloqueia a entrega.

| Requisito | Status | Evidência | Observação |
|---|---|---|---|
| RF01 Catálogo | Concluído | `openLibrary.ts`, Home, Catálogo e Detalhes; testes da integração e componentes | Metadados públicos não viram acervo automaticamente. |
| RF02 Busca/filtros/ordenação | Concluído | `CatalogPage.tsx`, `openLibrary.ts` e testes | Popularidade usa número de edições; autor ordena a página atual. |
| RF03 Empréstimos/reservas | Em andamento | RPCs transacionais aplicadas no remoto; incorporação cria duas cópias configuráveis; serviços, telas e testes automatizados | Falta validação ponta a ponta com duas contas institucionais e exemplares reais. |
| RF04 Detalhes/leitura | Em andamento | Detalhes, disponibilidade, tabelas e estados persistentes ativos | Falta validação remota com usuário autenticado. |
| RF05 Desejos (opcional) | Fora do escopo obrigatório | Inclusão, remoção, consulta e tabela remota já existem como funcionalidade adicional | Não bloqueia a entrega; notificação de disponibilidade não será implementada. |
| RF06 Autenticação | Concluído | Supabase Auth, rotas protegidas e testes de fluxos | Administração depende de `app_metadata.role`. |
| RF07 Administração | Em andamento | Incorporação, cópias, devolução, fila, relatórios, políticas e banco implementados | Falta atribuir/confirmar o papel `admin` e validar com uma conta administrativa. |
| RNF01 Responsividade | Concluído | Layouts mobile/desktop e classes responsivas | Revisão visual contínua. |
| RNF02 Acessibilidade | Concluído | Semântica, labels, foco visível, links de salto e auditorias automatizadas com `jest-axe` | Layout público e autenticação sem violações detectadas pela suíte automatizada. |
| RNF03 Performance | Concluído | Query cache, paginação, AbortSignal e lazy loading de capas | Divisão adicional de rotas é otimização futura. |
| RNF04 Segurança | Concluído | Auth real; RLS e funções transacionais ativas; leitura pública e bloqueios anônimos validados via REST | A chave privilegiada permanece fora do frontend. |
| RNF05 Persistência | Em andamento | Oito tabelas e migration sincronizada no remoto | Falta teste ponta a ponta autenticado antes de considerar a entrega concluída. |
| RNF06 Build/implantação | Em andamento | 97 testes e cobertura (91,84% statements; 85,17% branches), TypeScript e build aprovados; fallback SPA e configuração de hospedagem versionada | A publicação privada foi iniciada; falta confirmação terminal da plataforma. |

## Lacunas externas

- Migrations `20261015090000` e `20261015120000` aplicadas e sincronizadas no Supabase em 15/10/2026.
- A instituição precisa confirmar prazo e limites de circulação.
- É necessário validar os fluxos com contas de estudante e administrador.
- A implantação pública e sua URL ainda não foram fornecidas/executadas.
