create table if not exists public.mm2wild_transactions (
  id uuid primary key default gen_random_uuid(),
  user_uuid uuid not null references public.mm2wild_users(uuid) on delete cascade,
  method text not null,
  status text not null default 'completed' check (status in ('completed', 'pending', 'failed', 'declined')),
  amount numeric(20, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_mm2wild_transactions_user_created
  on public.mm2wild_transactions (user_uuid, created_at desc);

alter table public.mm2wild_transactions enable row level security;
revoke all on table public.mm2wild_transactions from anon, authenticated;
