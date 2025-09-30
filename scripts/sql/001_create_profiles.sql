-- Ensure required extension (available on Supabase)
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated-at trigger
create or replace function public.trigger_set_timestamp() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'profiles_set_timestamp'
  ) then
    create trigger profiles_set_timestamp
    before update on public.profiles
    for each row execute function public.trigger_set_timestamp();
  end if;
end$$;

-- RLS and policies
alter table public.profiles enable row level security;

-- Allow authenticated users to view their own profile
drop policy if exists "Profiles select own" on public.profiles;
create policy "Profiles select own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

-- Allow authenticated users to insert their own profile row
drop policy if exists "Profiles insert own" on public.profiles;
create policy "Profiles insert own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

-- Allow authenticated users to update their own profile
drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
