-- Add email, age, gender to profiles
alter table if exists public.profiles
  add column if not exists email text,
  add column if not exists age integer,
  add column if not exists gender text;

-- Update RLS: ensure insert/update checks still reference auth.uid()
-- No change needed if policies use auth.uid() = id
