create table if not exists public.mm2wild_fairness (
  id uuid primary key default gen_random_uuid(),
  user_uuid uuid not null references public.mm2wild_users(uuid) on delete cascade,
  server_seed text not null,
  server_seed_hash text not null,
  client_seed text not null default '',
  games_played bigint not null default 0 check (games_played >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

create index if not exists idx_mm2wild_fairness_user_active
  on public.mm2wild_fairness (user_uuid, active);

alter table public.mm2wild_fairness enable row level security;
revoke all on table public.mm2wild_fairness from anon, authenticated;
