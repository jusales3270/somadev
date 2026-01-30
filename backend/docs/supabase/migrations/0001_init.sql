-- Migration exemplo (ajuste ao seu schema real)

-- create extension se necessário
-- create extension if not exists "uuid-ossp";

-- tabela exemplo
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.todos enable row level security;

-- Policies
create policy "select own todos"
on public.todos
for select
using (auth.uid() = user_id);

create policy "insert own todos"
on public.todos
for insert
with check (auth.uid() = user_id);

create policy "update own todos"
on public.todos
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "delete own todos"
on public.todos
for delete
using (auth.uid() = user_id);