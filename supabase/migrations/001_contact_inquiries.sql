-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  service text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_inquiries enable row level security;

-- No public read/write; API uses service role key from Vercel only.
create policy "No public access"
  on public.contact_inquiries
  for all
  using (false);
