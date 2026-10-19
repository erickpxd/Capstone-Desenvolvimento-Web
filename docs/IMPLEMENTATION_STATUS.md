# Matriz de conformidade

Atualizada em 18/10/2026. “Concluído” exige código e evidência verificável. A lista de desejos é opcional e não bloqueia a entrega.

| Requisito | Status | Evidência | Observação |
|---|---|---|---|
| RF01 Catálogo | Concluído | `openLibrary.ts`, Home, Catálogo e Detalhes; testes da integração e componentes | Metadados públicos não viram acervo automaticamente. |
| RF02 Busca/filtros/ordenação | Concluído | `CatalogPage.tsx`, `openLibrary.ts` e testes | Popularidade usa número de edições; autor ordena a página atual. |
| RF03 Empréstimos/reservas | Concluído | RPCs transacionais aplicadas no remoto; acervo de demonstração com três cópias por obra; serviços, telas e testes automatizados | Empréstimo, renovação, devolução, reserva, cancelamento, fila, prazo e histórico implementados. |
| RF04 Detalhes/leitura | Concluído | Detalhes, disponibilidade, tabelas, estados persistentes e testes de integração | Estados `Lendo` e `Concluído` associados ao usuário autenticado. |
| RF05 Desejos (opcional) | Fora do escopo obrigatório | Inclusão, remoção, consulta e tabela remota já existem como funcionalidade adicional | Não bloqueia a entrega; notificação de disponibilidade não será implementada. |
| RF06 Autenticação | Concluído | Supabase Auth, rotas protegidas e testes de fluxos | Administração depende de `app_metadata.role`. |
| RF07 Administração | Concluído | Incorporação, cópias, devolução, fila, relatórios, políticas, autorização e testes implementados | O papel `admin` é atribuído com segurança em `app_metadata`. |
| RNF01 Responsividade | Concluído | Layouts mobile/desktop e classes responsivas | Revisão visual contínua. |
| RNF02 Acessibilidade | Concluído | Semântica, labels, foco visível, links de salto e auditorias automatizadas com `jest-axe` | Layout público e autenticação sem violações detectadas pela suíte automatizada. |
| RNF03 Performance | Concluído | Query cache, paginação, AbortSignal e lazy loading de capas | Divisão adicional de rotas é otimização futura. |
| RNF04 Segurança | Concluído | Auth real; RLS e funções transacionais ativas; leitura pública e bloqueios anônimos validados via REST | A chave privilegiada permanece fora do frontend. |
| RNF05 Persistência | Concluído | Oito tabelas, RLS, funções transacionais, migrations sincronizadas e testes da camada de serviço | Preferências visuais são a única informação mantida localmente. |
| RNF06 Build/implantação | Concluído | 99 testes; cobertura de 91,91% em statements e 85,13% em branches; TypeScript, build, fallback SPA e rotas públicas validadas | Publicado em `https://capstone-desenvolvimento-web.vercel.app`. |

## Aceite operacional recomendado

- Confirmar com a instituição os valores definitivos de prazo, limites de circulação e renovações.
- Executar um piloto de operação com contas institucionais de estudante e administrador antes do uso real.
