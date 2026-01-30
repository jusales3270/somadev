-- SomaData: schema + RLS (baseline)
-- Ajuste nomes/tabelas conforme o domínio do produto (SomaDev).

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Schema (opcional)
-- create schema if not exists app;

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  );
$$;

-- =========================
-- Core: perfis e roles
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','member')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index if not exists user_roles_user_id_idx on public.user_roles(user_id);

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  -- default role
  insert into public.user_roles (user_id, role)
  values (new.id, 'member')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================
-- Exemplo de domínio: projects + memberships
-- (substitua/expanda conforme o app)
-- =========================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_id_idx on public.projects(owner_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index if not exists project_members_user_id_idx on public.project_members(user_id);

-- Ensure owner membership
create or replace function public.ensure_project_owner_membership()
returns trigger
language plpgsql
as $$
begin
  insert into public.project_members(project_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (project_id, user_id) do update set role = 'owner';
  return new;
end;
$$;

drop trigger if exists projects_owner_membership on public.projects;
create trigger projects_owner_membership
after insert on public.projects
for each row execute function public.ensure_project_owner_membership();

-- =========================
-- RLS
-- =========================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- USER_ROLES (somente admin lê/escreve)
drop policy if exists "user_roles_admin_select" on public.user_roles;
create policy "user_roles_admin_select"
on public.user_roles
for select
to authenticated
using (public.is_admin());

drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write"
on public.user_roles
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "user_roles_admin_update" on public.user_roles;
create policy "user_roles_admin_update"
on public.user_roles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_roles_admin_delete" on public.user_roles;
create policy "user_roles_admin_delete"
on public.user_roles
for delete
to authenticated
using (public.is_admin());

-- PROJECTS
-- Select: owner, member, ou admin
drop policy if exists "projects_select_member_owner_admin" on public.projects;
create policy "projects_select_member_owner_admin"
on public.projects
for select
to authenticated
using (
  public.is_admin()
  or owner_id = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = id
      and pm.user_id = auth.uid()
  )
);

-- Insert: usuário autenticado cria, vira owner
drop policy if exists "projects_insert_owner_is_auth" on public.projects;
create policy "projects_insert_owner_is_auth"
on public.projects
for insert
to authenticated
with check (owner_id = auth.uid() or public.is_admin());

-- Update: owner, editor, admin
drop policy if exists "projects_update_owner_editor_admin" on public.projects;
create policy "projects_update_owner_editor_admin"
on public.projects
for update
to authenticated
using (
  public.is_admin()
  or owner_id = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = id
      and pm.user_id = auth.uid()
      and pm.role in ('owner','editor')
  )
)
with check (
  public.is_admin()
  or owner_id = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = id
      and pm.user_id = auth.uid()
      and pm.role in ('owner','editor')
  )
);

-- Delete: somente owner ou admin
drop policy if exists "projects_delete_owner_admin" on public.projects;
create policy "projects_delete_owner_admin"
on public.projects
for delete
to authenticated
using (public.is_admin() or owner_id = auth.uid());

-- PROJECT_MEMBERS
-- Select: membros do projeto ou admin
drop policy if exists "project_members_select_member_admin" on public.project_members;
create policy "project_members_select_member_admin"
on public.project_members
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = project_id
      and pm.user_id = auth.uid()
  )
);

-- Insert: owner/admin pode convidar; editor não.
drop policy if exists "project_members_insert_owner_admin" on public.project_members;
create policy "project_members_insert_owner_admin"
on public.project_members
for insert
to authenticated
with check (
  public.is_admin()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = project_id
      and pm.user_id = auth.uid()
      and pm.role = 'owner'
  )
);

-- Update: owner/admin
drop policy if exists "project_members_update_owner_admin" on public.project_members;
create policy "project_members_update_owner_admin"
on public.project_members
for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = project_id
      and pm.user_id = auth.uid()
      and pm.role = 'owner'
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = project_id
      and pm.user_id = auth.uid()
      and pm.role = 'owner'
  )
);

-- Delete: owner/admin (remover membro)
drop policy if exists "project_members_delete_owner_admin" on public.project_members;
create policy "project_members_delete_owner_admin"
on public.project_members
for delete
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = project_id
      and pm.user_id = auth.uid()
      and pm.role = 'owner'
  )
);

-- =========================
-- Grants (Supabase padrão costuma gerenciar, mas deixo explícito)
-- =========================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_members to authenticated;

-- user_roles só via policies (admin), mas precisa grant p/ passar pelo RLS
grant select, insert, update, delete on public.user_roles to authenticated;