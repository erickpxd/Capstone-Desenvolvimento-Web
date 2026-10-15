# Requisitos do Capstone

Este documento separa o catálogo bibliográfico público do acervo físico da universidade. A Open Library fornece metadados; o Supabase controla usuários, exemplares e circulação.

## Requisitos funcionais

| ID | Requisito | Critério de aceitação |
|---|---|---|
| RF01 | Catálogo | Consultar a Open Library, exibir capa, título, autor, descrição, categoria e abrir detalhes; disponibilidade vem somente do acervo interno. |
| RF02 | Busca, filtros e ordenação | Buscar por texto, título ou autor; combinar categoria e idioma; ordenar por publicação, autor ou popularidade; paginar e preservar a consulta na URL. |
| RF03 | Empréstimos e reservas | Usuário autenticado solicita exemplar disponível, reserva obra indisponível, consulta prazos/histórico e mantém dados após recarga. Operações concorrentes são atômicas no banco. |
| RF04 | Detalhes e leitura | Rota estável por obra, informações bibliográficas, situação do acervo e estado `Lendo`, `Concluído` ou `Lista de desejos`. |
| RF05 | Lista de desejos (opcional) | Adicionar, remover e consultar itens sem duplicação. Notificações de disponibilidade estão fora do escopo acordado. |
| RF06 | Autenticação | Cadastro, login, recuperação, sessão, logout e associação dos dados ao usuário via Supabase Auth. |
| RF07 | Administração | Administrador incorpora obras, cadastra exemplares, acompanha circulação e configura políticas. O papel é definido em `app_metadata`, nunca pelo navegador. |

## Requisitos não funcionais

| ID | Requisito | Critério de aceitação |
|---|---|---|
| RNF01 | Responsividade | Fluxos utilizáveis sem overflow em celular, tablet e desktop. |
| RNF02 | Acessibilidade | HTML semântico, labels, foco visível, teclado, textos alternativos e mensagens compreensíveis. |
| RNF03 | Performance | Paginação, cache de consultas, imagens tardias e cancelamento de requisições. |
| RNF04 | Segurança | Validação no cliente e no banco, RLS, funções transacionais, chave pública no frontend e nenhum segredo versionado. |
| RNF05 | Persistência | Dados multiusuário no Supabase; Local Storage somente para preferências visuais. |
| RNF06 | Qualidade e implantação | Testes, TypeScript, build, fallback SPA e documentação reproduzível. |

## Decisões configuráveis

Prazo, limite de empréstimos e limite de renovações não são regras oficiais do PDF. Seus valores ficam em `library_settings` e podem ser alterados por administrador. A migration inclui valores iniciais apenas para tornar o ambiente executável; eles devem ser validados pela instituição antes da publicação.
