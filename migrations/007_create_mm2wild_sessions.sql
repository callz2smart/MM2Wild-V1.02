create table if not exists public.mm2wild_sessions (
  id uuid primary key default gen_random_uuid(),
  user_uuid uuid not null references public.mm2wild_users(uuid) on delete cascade,
  browser text not null default 'Google Chrome',
  os text not null default 'macOS',
  ip_address text not null,
  country_code text not null default 'US',
  country_name text not null default 'United States',
  is_current boolean not null default false,
  last_active timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_mm2wild_sessions_user_active
  on public.mm2wild_sessions (user_uuid, last_active desc);

alter table public.mm2wild_sessions enable row level security;
revoke all on table public.mm2wild_sessions from anon, authenticated;
