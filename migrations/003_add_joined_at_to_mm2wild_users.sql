alter table public.mm2wild_users
add column if not exists joined_at timestamptz not null default now();
