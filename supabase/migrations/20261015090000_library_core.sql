-- Execute somente após revisão no Supabase. O frontend usa apenas a chave publishable.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.library_books (
  id uuid primary key default gen_random_uuid(),
  open_library_key text not null unique check (open_library_key ~ '^/works/OL[0-9]+W$'),
  title text not null check (char_length(title) between 1 and 500),
  author text not null check (char_length(author) between 1 and 300),
  cover_url text,
  category text,
  published_year integer check (published_year between 1000 and 2200),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.book_copies (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.library_books(id) on delete restrict,
  code text not null unique check (char_length(code) between 1 and 80),
  status text not null default 'available' check (status in ('available','borrowed','maintenance','lost')),
  created_at timestamptz not null default now()
);

create table if not exists public.library_settings (
  id boolean primary key default true check (id),
  loan_days integer not null default 14 check (loan_days between 1 and 120),
  max_active_loans integer not null default 3 check (max_active_loans between 1 and 30),
  max_renewals integer not null default 1 check (max_renewals between 0 and 10),
  updated_at timestamptz not null default now()
);
insert into public.library_settings (id) values (true) on conflict (id) do nothing;

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  copy_id uuid not null references public.book_copies(id) on delete restrict,
  borrowed_at timestamptz not null default now(),
  due_at timestamptz not null,
  returned_at timestamptz,
  renewals integer not null default 0 check (renewals >= 0),
  status text not null default 'active' check (status in ('active','returned')),
  check ((status = 'active' and returned_at is null) or (status = 'returned' and returned_at is not null))
);
create unique index if not exists one_active_loan_per_copy on public.loans(copy_id) where status = 'active';
create index if not exists loans_user_idx on public.loans(user_id, borrowed_at desc);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.library_books(id) on delete cascade,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  status text not null default 'active' check (status in ('active','fulfilled','cancelled'))
);
create unique index if not exists one_active_reservation_per_user_book on public.reservations(user_id, book_id) where status = 'active';

create table if not exists public.reading_statuses (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  open_library_key text not null check (open_library_key ~ '^/works/OL[0-9]+W$'),
  status text not null check (status in ('reading','completed')),
  title text not null,
  author text not null,
  cover_url text,
  updated_at timestamptz not null default now(),
  primary key (user_id, open_library_key)
);

create table if not exists public.wishlist_items (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  open_library_key text not null check (open_library_key ~ '^/works/OL[0-9]+W$'),
  title text not null,
  author text not null,
  cover_url text,
  created_at timestamptz not null default now(),
  primary key (user_id, open_library_key)
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create or replace function public.create_profile_for_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(user_id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(user_id) do nothing;
  return new;
end $$;
drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup after insert on auth.users for each row execute function public.create_profile_for_user();
insert into public.profiles(user_id,full_name)
select id,coalesce(raw_user_meta_data->>'full_name','') from auth.users
on conflict(user_id) do nothing;

create or replace function public.borrow_book(p_book_id uuid) returns public.loans
language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_copy public.book_copies; v_settings public.library_settings; v_loan public.loans;
begin
  if v_user is null then raise exception 'Autenticação necessária' using errcode = '42501'; end if;
  select * into v_settings from public.library_settings where id = true;
  if (select count(*) from public.loans where user_id=v_user and status='active') >= v_settings.max_active_loans then raise exception 'Limite de empréstimos ativos atingido'; end if;
  if exists(select 1 from public.reservations where book_id=p_book_id and status='active' and user_id<>v_user and created_at=(select min(created_at) from public.reservations where book_id=p_book_id and status='active')) then raise exception 'Exemplar destinado ao primeiro usuário da fila de reservas'; end if;
  select * into v_copy from public.book_copies where book_id=p_book_id and status='available' order by created_at for update skip locked limit 1;
  if v_copy.id is null then raise exception 'Nenhum exemplar disponível'; end if;
  update public.book_copies set status='borrowed' where id=v_copy.id;
  insert into public.loans(user_id,copy_id,due_at) values(v_user,v_copy.id,now()+make_interval(days=>v_settings.loan_days)) returning * into v_loan;
  update public.reservations set status='fulfilled',resolved_at=now() where user_id=v_user and book_id=p_book_id and status='active';
  return v_loan;
end $$;

create or replace function public.fulfill_reservation(p_reservation_id uuid) returns public.loans
language plpgsql security definer set search_path = '' as $$
declare v_res public.reservations; v_copy public.book_copies; v_settings public.library_settings; v_loan public.loans;
begin
  if not public.is_admin() then raise exception 'Apenas administradores atendem reservas' using errcode='42501'; end if;
  select * into v_res from public.reservations where id=p_reservation_id and status='active' for update;
  if v_res.id is null then raise exception 'Reserva ativa não encontrada'; end if;
  if exists(select 1 from public.reservations where book_id=v_res.book_id and status='active' and created_at<v_res.created_at) then raise exception 'Existe uma reserva anterior na fila'; end if;
  select * into v_copy from public.book_copies where book_id=v_res.book_id and status='available' order by created_at for update skip locked limit 1;
  if v_copy.id is null then raise exception 'Nenhum exemplar disponível'; end if;
  select * into v_settings from public.library_settings where id=true;
  if (select count(*) from public.loans where user_id=v_res.user_id and status='active') >= v_settings.max_active_loans then raise exception 'Usuário atingiu o limite de empréstimos'; end if;
  update public.book_copies set status='borrowed' where id=v_copy.id;
  insert into public.loans(user_id,copy_id,due_at) values(v_res.user_id,v_copy.id,now()+make_interval(days=>v_settings.loan_days)) returning * into v_loan;
  update public.reservations set status='fulfilled',resolved_at=now() where id=v_res.id;
  return v_loan;
end $$;

create or replace function public.reserve_book(p_book_id uuid) returns public.reservations
language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_reservation public.reservations;
begin
  if v_user is null then raise exception 'Autenticação necessária' using errcode = '42501'; end if;
  if exists(select 1 from public.book_copies where book_id=p_book_id and status='available') then raise exception 'Há exemplar disponível; solicite o empréstimo'; end if;
  if not exists(select 1 from public.book_copies where book_id=p_book_id) then raise exception 'Obra não pertence ao acervo'; end if;
  insert into public.reservations(user_id,book_id) values(v_user,p_book_id) returning * into v_reservation;
  return v_reservation;
exception when unique_violation then raise exception 'Você já possui uma reserva ativa para esta obra';
end $$;

create or replace function public.cancel_reservation(p_reservation_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.reservations set status='cancelled',resolved_at=now() where id=p_reservation_id and (user_id=auth.uid() or public.is_admin()) and status='active';
  if not found then raise exception 'Reserva ativa não encontrada'; end if;
end $$;

create or replace function public.renew_loan(p_loan_id uuid) returns public.loans
language plpgsql security definer set search_path = '' as $$
declare v_loan public.loans; v_settings public.library_settings;
begin
  select l.* into v_loan from public.loans l where l.id=p_loan_id and l.user_id=auth.uid() and l.status='active' for update;
  if v_loan.id is null then raise exception 'Empréstimo ativo não encontrado'; end if;
  select * into v_settings from public.library_settings where id=true;
  if v_loan.renewals >= v_settings.max_renewals then raise exception 'Limite de renovações atingido'; end if;
  if exists(select 1 from public.reservations r join public.book_copies c on c.book_id=r.book_id where c.id=v_loan.copy_id and r.status='active') then raise exception 'Obra possui reserva ativa'; end if;
  update public.loans set due_at=greatest(due_at,now())+make_interval(days=>v_settings.loan_days), renewals=renewals+1 where id=p_loan_id returning * into v_loan;
  return v_loan;
end $$;

create or replace function public.return_loan(p_loan_id uuid) returns public.loans
language plpgsql security definer set search_path = '' as $$
declare v_loan public.loans;
begin
  if not public.is_admin() then raise exception 'Apenas administradores registram devoluções' using errcode='42501'; end if;
  update public.loans set status='returned',returned_at=now() where id=p_loan_id and status='active' returning * into v_loan;
  if v_loan.id is null then raise exception 'Empréstimo ativo não encontrado'; end if;
  update public.book_copies set status='available' where id=v_loan.copy_id;
  return v_loan;
end $$;

alter table public.profiles enable row level security;
alter table public.library_books enable row level security;
alter table public.book_copies enable row level security;
alter table public.library_settings enable row level security;
alter table public.loans enable row level security;
alter table public.reservations enable row level security;
alter table public.reading_statuses enable row level security;
alter table public.wishlist_items enable row level security;

create policy "profile own or admin read" on public.profiles for select using (user_id=auth.uid() or public.is_admin());
create policy "profile own update" on public.profiles for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "catalog public read" on public.library_books for select using (true);
create policy "copies public read" on public.book_copies for select using (true);
create policy "settings public read" on public.library_settings for select using (true);
create policy "admin manages books" on public.library_books for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manages copies" on public.book_copies for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manages settings" on public.library_settings for update using (public.is_admin()) with check (public.is_admin());
create policy "own or admin loans read" on public.loans for select using (user_id=auth.uid() or public.is_admin());
create policy "own or admin reservations read" on public.reservations for select using (user_id=auth.uid() or public.is_admin());
create policy "own reading" on public.reading_statuses for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "own wishlist" on public.wishlist_items for all using (user_id=auth.uid()) with check (user_id=auth.uid());

revoke all on public.profiles, public.library_books, public.book_copies, public.library_settings, public.loans, public.reservations, public.reading_statuses, public.wishlist_items from anon, authenticated;
grant select on public.library_books, public.book_copies, public.library_settings to anon, authenticated;
grant select, insert, update, delete on public.library_books, public.book_copies to authenticated;
grant update on public.library_settings to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.loans, public.reservations to authenticated;
grant select, insert, update, delete on public.reading_statuses, public.wishlist_items to authenticated;

revoke execute on function public.borrow_book(uuid), public.reserve_book(uuid), public.cancel_reservation(uuid), public.renew_loan(uuid), public.return_loan(uuid), public.fulfill_reservation(uuid) from public, anon;
grant execute on function public.borrow_book(uuid), public.reserve_book(uuid), public.cancel_reservation(uuid), public.renew_loan(uuid), public.return_loan(uuid), public.fulfill_reservation(uuid) to authenticated;
