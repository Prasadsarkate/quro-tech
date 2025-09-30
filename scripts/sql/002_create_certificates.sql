-- Ensure required extension (available on Supabase)
create extension if not exists "pgcrypto";

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  internship text not null,
  duration_label text not null,
  custom_hours integer,
  custom_weeks integer,
  price integer not null,
  serial text not null unique,
  issued_at timestamptz not null default now()
);

create index if not exists certificates_user_id_idx on public.certificates (user_id);
create unique index if not exists certificates_serial_key on public.certificates (serial);

-- RLS and policies
alter table public.certificates enable row level security;

-- Authenticated users can read their own certificates
drop policy if exists "Certificates select own" on public.certificates;
create policy "Certificates select own"
on public.certificates for select
to authenticated
using (auth.uid() = user_id);

-- Authenticated users can insert their own certificates
drop policy if exists "Certificates insert own" on public.certificates;
create policy "Certificates insert own"
on public.certificates for insert
to authenticated
with check (auth.uid() = user_id);

-- (Optional) No updates/deletes by default for safety.
