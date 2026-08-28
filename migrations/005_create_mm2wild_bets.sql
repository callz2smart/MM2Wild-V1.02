create table if not exists public.mm2wild_bets (
  id uuid primary key default gen_random_uuid(),
  user_uuid uuid not null references public.mm2wild_users(uuid) on delete cascade,
  game text not null,
  status text not null default 'lost' check (status in ('won', 'lost', 'push')),
  amount numeric(20, 2) not null default 0,
  profit numeric(20, 2) not null default 0,
  multiplier numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_mm2wild_bets_user_created
  on public.mm2wild_bets (user_uuid, created_at desc);

alter table public.mm2wild_bets enable row level security;
revoke all on table public.mm2wild_bets from anon, authenticated;
