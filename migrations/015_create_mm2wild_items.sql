create extension if not exists pgcrypto;

create table if not exists public.mm2wild_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  value numeric(20, 4) not null check (value > 0),
  image_url text,
  rarity text not null check (rarity in ('ancients', 'chromas', 'godlies', 'legendaries')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_mm2wild_items_value
  on public.mm2wild_items (value desc);

create index if not exists idx_mm2wild_items_rarity_value
  on public.mm2wild_items (rarity, value desc);

alter table public.mm2wild_items enable row level security;
revoke all on table public.mm2wild_items from anon, authenticated;
