create table if not exists public.mm2wild_affiliates (
  id uuid primary key default gen_random_uuid(),
  user_uuid uuid not null unique references public.mm2wild_users(uuid) on delete cascade,
  code text not null unique check (code = lower(code) and code ~ '^[a-z0-9_-]{3,24}$'),
  commission_rate numeric(5, 2) not null default 5.00 check (commission_rate >= 0 and commission_rate <= 100),
  available_earnings numeric(20, 2) not null default 0 check (available_earnings >= 0),
  total_earned numeric(20, 2) not null default 0 check (total_earned >= 0),
  total_wagered numeric(20, 2) not null default 0 check (total_wagered >= 0),
  active_users integer not null default 0 check (active_users >= 0),
  total_users integer not null default 0 check (total_users >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_mm2wild_affiliates_code_lower
  on public.mm2wild_affiliates (lower(code));

alter table public.mm2wild_affiliates enable row level security;
revoke all on table public.mm2wild_affiliates from anon, authenticated;
