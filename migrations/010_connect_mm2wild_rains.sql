do $$
begin
  if to_regclass('public.mm2wild_rains') is null
     and to_regclass('public.mm2wild_rain') is not null then
    alter table public.mm2wild_rain rename to mm2wild_rains;
  end if;
end $$;

create table if not exists public.mm2wild_rains (
  id uuid primary key default gen_random_uuid(),
  pool numeric(20, 2) not null default 300 check (pool >= 0),
  status text not null default 'active',
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '60 minutes'),
  join_ends_at timestamptz not null default (now() + interval '61 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mm2wild_rains
  add column if not exists join_ends_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.mm2wild_rains
set join_ends_at = ends_at + interval '1 minute'
where join_ends_at is null;

alter table public.mm2wild_rains alter column join_ends_at set not null;
alter table public.mm2wild_rains drop constraint if exists mm2wild_rain_status_check;
alter table public.mm2wild_rains drop constraint if exists mm2wild_rains_status_check;
alter table public.mm2wild_rains
  add constraint mm2wild_rains_status_check
  check (status in ('active', 'joining', 'completed'));

drop index if exists public.idx_mm2wild_rain_status;
create index if not exists idx_mm2wild_rains_status
  on public.mm2wild_rains (status, ends_at desc);

create table if not exists public.mm2wild_rain_entries (
  rain_id uuid not null references public.mm2wild_rains(id) on delete cascade,
  user_uuid uuid not null references public.mm2wild_users(uuid) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (rain_id, user_uuid)
);

create index if not exists idx_mm2wild_rain_entries_rain
  on public.mm2wild_rain_entries (rain_id, joined_at);

alter table public.mm2wild_rains enable row level security;
alter table public.mm2wild_rain_entries enable row level security;
revoke all on table public.mm2wild_rains from anon, authenticated;
revoke all on table public.mm2wild_rain_entries from anon, authenticated;
