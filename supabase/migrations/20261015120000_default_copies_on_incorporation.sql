alter table public.library_settings
  add column if not exists default_copy_count integer not null default 2
  check (default_copy_count between 0 and 50);

create or replace function public.incorporate_library_book(
  p_open_library_key text,
  p_title text,
  p_author text,
  p_cover_url text default null,
  p_category text default null,
  p_published_year integer default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_book_id uuid;
  v_default_count integer;
  v_existing_count integer;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores incorporam obras' using errcode = '42501';
  end if;

  insert into public.library_books(open_library_key,title,author,cover_url,category,published_year,metadata)
  values(p_open_library_key,p_title,p_author,p_cover_url,p_category,p_published_year,coalesce(p_metadata,'{}'::jsonb))
  on conflict(open_library_key) do update set
    title=excluded.title,
    author=excluded.author,
    cover_url=excluded.cover_url,
    category=excluded.category,
    published_year=excluded.published_year,
    metadata=excluded.metadata
  returning id into v_book_id;

  select default_copy_count into v_default_count from public.library_settings where id=true;
  select count(*)::integer into v_existing_count from public.book_copies where book_id=v_book_id;

  insert into public.book_copies(book_id,code)
  select v_book_id,
    'ACV-' || upper(substr(replace(v_book_id::text,'-',''),1,8)) || '-' || lpad(number::text,2,'0')
  from generate_series(v_existing_count + 1, greatest(v_existing_count, v_default_count)) as number
  on conflict(code) do nothing;

  return v_book_id;
end $$;

-- Obras já incorporadas e ainda sem a quantidade padrão são completadas sem
-- modificar nem remover exemplares existentes.
insert into public.book_copies(book_id,code)
select book.id,
  'ACV-' || upper(substr(replace(book.id::text,'-',''),1,8)) || '-' || lpad(number::text,2,'0')
from public.library_books book
cross join public.library_settings settings
cross join lateral generate_series(
  (select count(*)::integer + 1 from public.book_copies copy where copy.book_id=book.id),
  greatest(
    (select count(*)::integer from public.book_copies copy where copy.book_id=book.id),
    settings.default_copy_count
  )
) as number
on conflict(code) do nothing;

revoke execute on function public.incorporate_library_book(text,text,text,text,text,integer,jsonb) from public, anon;
grant execute on function public.incorporate_library_book(text,text,text,text,text,integer,jsonb) to authenticated;
