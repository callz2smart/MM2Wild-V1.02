-- Global provably-fair seed for the shared roulette wheel.
create table if not exists public.mm2wild_roulette_seed (
  id uuid primary key default gen_random_uuid(),
  server_seed text not null,
  server_seed_hash text not null,
  client_seed text not null default '',
  nonce bigint not null default 0 check (nonce >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

create index if not exists idx_mm2wild_roulette_seed_active
  on public.mm2wild_roulette_seed (active);

-- One row per completed roulette round, for verification and history.
create table if not exists public.mm2wild_roulette_rounds (
  id uuid primary key default gen_random_uuid(),
  seed_id uuid not null references public.mm2wild_roulette_seed(id) on delete cascade,
  nonce bigint not null check (nonce >= 0),
  client_seed text not null default '',
  result text not null check (result in ('blue', 'green', 'gold', 'purple')),
  total_pot numeric(20, 2) not null default 0,
  total_players integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_mm2wild_roulette_rounds_created
  on public.mm2wild_roulette_rounds (created_at desc);

-- One row per player per round: records their bet, the result, and payout.
create table if not exists public.mm2wild_roulette_bets (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references public.mm2wild_roulette_rounds(id) on delete cascade,
  user_uuid uuid not null references public.mm2wild_users(uuid) on delete cascade,
  color text not null check (color in ('blue', 'green', 'gold', 'purple')),
  amount numeric(20, 2) not null default 0,
  result text not null check (result in ('blue', 'green', 'gold', 'purple')),
  multiplier numeric(10, 2) not null default 0,
  payout numeric(20, 2) not null default 0,
  profit numeric(20, 2) not null default 0,
  status text not null default 'lost' check (status in ('won', 'lost')),
  created_at timestamptz not null default now()
);

create index if not exists idx_mm2wild_roulette_bets_user_created
  on public.mm2wild_roulette_bets (user_uuid, created_at desc);
create index if not exists idx_mm2wild_roulette_bets_round
  on public.mm2wild_roulette_bets (round_id);

alter table public.mm2wild_roulette_seed enable row level security;
alter table public.mm2wild_roulette_rounds enable row level security;
alter table public.mm2wild_roulette_bets enable row level security;
revoke all on table public.mm2wild_roulette_seed from anon, authenticated;
revoke all on table public.mm2wild_roulette_rounds from anon, authenticated;
revoke all on table public.mm2wild_roulette_bets from anon, authenticated;
