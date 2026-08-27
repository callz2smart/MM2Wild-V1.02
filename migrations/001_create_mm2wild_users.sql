create extension if not exists pgcrypto;

create table if not exists public.mm2wild_users (
  uuid uuid primary key default gen_random_uuid(),
  roblox_user_id bigint not null unique,
  username text not null,
  rank text not null default 'user',
  level integer not null default 1 check (level >= 1),
  mm2_balance numeric(20, 2) not null default 0 check (mm2_balance >= 0),
  crypto_balance numeric(20, 8) not null default 0 check (crypto_balance >= 0),
  avatar_headshot text not null,
  total_bets bigint not null default 0 check (total_bets >= 0),
  games_won bigint not null default 0 check (games_won >= 0),
  total_deposited numeric(20, 2) not null default 0 check (total_deposited >= 0),
  total_wagered numeric(20, 2) not null default 0 check (total_wagered >= 0)
);

alter table public.mm2wild_users enable row level security;

drop policy if exists "Public profiles are readable" on public.mm2wild_users;
drop policy if exists "Verified defaults can be inserted" on public.mm2wild_users;
revoke all on table public.mm2wild_users from anon, authenticated;
