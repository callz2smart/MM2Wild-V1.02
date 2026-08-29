alter table public.mm2wild_rains alter column pool set default 250;

alter table public.mm2wild_rains drop constraint if exists mm2wild_rains_status_check;
alter table public.mm2wild_rains
  add constraint mm2wild_rains_status_check
  check (status in ('active', 'joining', 'cooldown', 'completed'));

drop index if exists public.idx_mm2wild_rains_single_open;
create unique index idx_mm2wild_rains_single_open
  on public.mm2wild_rains ((1))
  where status in ('active', 'joining', 'cooldown');
