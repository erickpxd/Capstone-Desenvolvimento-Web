# Matriz de conformidade

Atualizada em 15/10/2026. “Concluído” exige código e evidência verificável; a ativação do banco remoto é registrada separadamente.

| Requisito | Status | Evidência | Observação |
|---|---|---|---|
| RF01 Catálogo | Concluído | `openLibrary.ts`, Home, Catálogo e Detalhes; testes da integração e componentes | Metadados públicos não viram acervo automaticamente. |
| RF02 Busca/filtros/ordenação | Concluído | `CatalogPage.tsx`, `openLibrary.ts` e testes | Popularidade usa número de edições; autor ordena a página atual. |
| RF03 Empréstimos/reservas | Bloqueado | RPCs transacionais, serviços e telas implementados | Para operar no ambiente conectado, depende da aplicação autorizada da migration. |
| RF04 Detalhes/leitura | Bloqueado | Detalhes, disponibilidade e estados persistentes implementados | A ativação da persistência depende da migration remota. |
| RF05 Desejos (opcional) | Bloqueado | Inclusão, remoção e consulta implementadas | Notificação foi explicitamente retirada do escopo; persistência aguarda migration. |
| RF06 Autenticação | Concluído | Supabase Auth, rotas protegidas e testes de fluxos | Administração depende de `app_metadata.role`. |
| RF07 Administração | Bloqueado | Incorporação, cópias, devolução, fila, relatórios e políticas implementados | Operação real depende da migration e do papel em `app_metadata`. |
| RNF01 Responsividade | Concluído | Layouts mobile/desktop e classes responsivas | Revisão visual contínua. |
| RNF02 Acessibilidade | Em andamento | Semântica, labels, foco e estados de erro | Auditoria automatizada ainda pendente. |
| RNF03 Performance | Concluído | Query cache, paginação, AbortSignal e lazy loading de capas | Divisão adicional de rotas é otimização futura. |
| RNF04 Segurança | Bloqueado | Auth real; RLS e funções transacionais versionadas | Políticas ainda não estão ativas no remoto. |
| RNF05 Persistência | Bloqueado | Contratos do Supabase em implementação | O projeto remoto não possui as tabelas; requer autorização para aplicar migration. |
| RNF06 Build/implantação | Em andamento | 92 testes e cobertura (91,91% statements; 85% branches), TypeScript e build aprovados em 15/10/2026; fallback SPA | Publicação efetiva não foi executada. |

## Lacunas externas

- Aplicar e validar a migration no Supabase requer autorização explícita.
- A instituição precisa confirmar prazo e limites de circulação.
- A implantação pública e sua URL ainda não foram fornecidas/executadas.
