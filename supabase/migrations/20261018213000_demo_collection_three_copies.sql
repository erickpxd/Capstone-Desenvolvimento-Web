-- Acervo de demonstração: as obras exibidas na curadoria inicial e clássicos
-- brasileiros ficam disponíveis para testar empréstimos e reservas.
update public.library_settings
set default_copy_count = 3,
    updated_at = now()
where id = true;

insert into public.library_books
  (open_library_key, title, author, cover_url, category, published_year, metadata)
values
  ('/works/OL3707493W', 'Pequena bibliografia crítica da literatura brasileira', 'Otto Maria Carpeaux', null, 'Literatura brasileira', 1951, '{"demo":true}'::jsonb),
  ('/works/OL3874305W', 'História concisa da literatura brasileira', 'Alfredo Bosi', 'https://covers.openlibrary.org/b/id/13338721-L.jpg?default=false', 'Literatura brasileira', 1970, '{"demo":true}'::jsonb),
  ('/works/OL1003040W', 'Dom Casmurro', 'Machado de Assis', 'https://covers.openlibrary.org/b/id/647501-L.jpg?default=false', 'Literatura brasileira', 1900, '{"demo":true}'::jsonb),
  ('/works/OL3205924W', 'Formação da literatura brasileira', 'Antonio Candido', null, 'Literatura brasileira', 1959, '{"demo":true}'::jsonb),
  ('/works/OL5445952W', 'Pequena história da literatura brasileira', 'Ronald de Carvalho', null, 'Literatura brasileira', 1958, '{"demo":true}'::jsonb),
  ('/works/OL5150089W', 'Estudos de literatura brasileira', 'Haroldo Bruno', null, 'Literatura brasileira', 1957, '{"demo":true}'::jsonb),
  ('/works/OL3423774W', 'História da literatura brasileira', 'Sílvio Romero', null, 'Literatura brasileira', 1943, '{"demo":true}'::jsonb),
  ('/works/OL1004263W', 'Aspectos da literatura brasileira', 'Mário de Andrade', null, 'Literatura brasileira', 1943, '{"demo":true}'::jsonb),
  ('/works/OL1003017W', 'Memórias póstumas de Brás Cubas', 'Machado de Assis', 'https://covers.openlibrary.org/b/id/123152-L.jpg?default=false', 'Literatura brasileira', 1881, '{"demo":true}'::jsonb),
  ('/works/OL12110487W', 'O cortiço', 'Aluísio Azevedo', null, 'Literatura brasileira', null, '{"demo":true}'::jsonb),
  ('/works/OL1525650W', 'Iracema', 'José de Alencar', 'https://covers.openlibrary.org/b/id/2664651-L.jpg?default=false', 'Literatura brasileira', 1886, '{"demo":true}'::jsonb),
  ('/works/OL1002120W', 'A hora da estrela', 'Clarice Lispector', 'https://covers.openlibrary.org/b/id/650866-L.jpg?default=false', 'Literatura brasileira', 1977, '{"demo":true}'::jsonb),
  ('/works/OL1248157W', 'Capitães da Areia', 'Jorge Amado', 'https://covers.openlibrary.org/b/id/4178919-L.jpg?default=false', 'Literatura brasileira', 1937, '{"demo":true}'::jsonb)
on conflict (open_library_key) do update set
  title = excluded.title,
  author = excluded.author,
  cover_url = excluded.cover_url,
  category = excluded.category,
  published_year = excluded.published_year,
  metadata = public.library_books.metadata || excluded.metadata;

-- Completa cada obra do acervo até três exemplares, preservando empréstimos e
-- códigos já existentes. Obras futuras usam o mesmo total padrão.
insert into public.book_copies (book_id, code)
select book.id,
  'ACV-' || upper(substr(replace(book.id::text, '-', ''), 1, 8)) || '-' || lpad(number::text, 2, '0')
from public.library_books book
cross join lateral generate_series(
  (select count(*)::integer + 1 from public.book_copies copy where copy.book_id = book.id),
  greatest((select count(*)::integer from public.book_copies copy where copy.book_id = book.id), 3)
) as number
on conflict (code) do nothing;
