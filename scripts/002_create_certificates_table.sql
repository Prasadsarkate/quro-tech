-- Create certificates table
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  serial text unique not null,
  internship text not null,
  duration_label text not null,
  custom_hours integer,
  custom_weeks integer,
  price decimal(10,2) not null,
  full_name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.certificates enable row level security;

-- Create RLS policies for certificates
create policy "certificates_select_own"
  on public.certificates for select
  using (auth.uid() = user_id);

create policy "certificates_insert_own"
  on public.certificates for insert
  with check (auth.uid() = user_id);

create policy "certificates_update_own"
  on public.certificates for update
  using (auth.uid() = user_id);

create policy "certificates_delete_own"
  on public.certificates for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists certificates_user_id_idx on public.certificates(user_id);
create index if not exists certificates_issued_at_idx on public.certificates(issued_at desc);
