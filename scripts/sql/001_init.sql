/* Initial schema for profiles and certificates with RLS */

-- Enable extension if needed (may already be enabled)
-- create extension if not exists "pgcrypto";

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Policy: user can manage own profile
create policy if not exists "profile_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy if not exists "profile_upsert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy if not exists "profile_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Certificates table
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  internship text not null,
  duration_label text not null,
  custom_hours int,
  custom_weeks int,
  price int not null,
  serial text not null unique,
  issued_at timestamptz not null default now()
);

create index if not exists idx_certificates_user on public.certificates(user_id);
create index if not exists idx_certificates_serial on public.certificates(serial);

alter table public.certificates enable row level security;

-- RLS: owner can read own certificates
create policy if not exists "cert_select_own"
on public.certificates for select
using (auth.uid() = user_id);

-- RLS: owner can insert own certificates (via server action with user session)
create policy if not exists "cert_insert_own"
on public.certificates for insert
with check (auth.uid() = user_id);

-- No public select policy; verification uses service role in API route.
