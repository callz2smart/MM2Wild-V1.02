create table if not exists public.mm2wild_rain (
  id uuid primary key default gen_random_uuid(),
  pool numeric(20, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'distributing', 'completed')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '5 minutes'),
  created_at timestamptz not null default now()
);

create index if not exists idx_mm2wild_rain_status
  on public.mm2wild_rain (status, ends_at desc);

alter table public.mm2wild_rain enable row level security;
revoke all on table public.mm2wild_rain from anon, authenticated;
