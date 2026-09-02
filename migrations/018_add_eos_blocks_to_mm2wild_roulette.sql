alter table public.mm2wild_roulette_rounds
  alter column result drop not null;

alter table public.mm2wild_roulette_rounds
  add column if not exists eos_block_num bigint,
  add column if not exists eos_block_id text,
  add column if not exists eos_chain_id text,
  add column if not exists eos_block_status text,
  add column if not exists eos_requested_at timestamptz,
  add column if not exists eos_mined_at timestamptz;

alter table public.mm2wild_roulette_rounds
  drop constraint if exists mm2wild_roulette_rounds_eos_block_status_check;

alter table public.mm2wild_roulette_rounds
  add constraint mm2wild_roulette_rounds_eos_block_status_check
  check (eos_block_status in ('pending', 'mined'));

alter table public.mm2wild_roulette_rounds
  drop constraint if exists mm2wild_roulette_rounds_eos_block_num_check;

alter table public.mm2wild_roulette_rounds
  add constraint mm2wild_roulette_rounds_eos_block_num_check
  check (eos_block_num is null or eos_block_num > 0);

alter table public.mm2wild_roulette_rounds
  drop constraint if exists mm2wild_roulette_rounds_eos_block_id_check;

alter table public.mm2wild_roulette_rounds
  add constraint mm2wild_roulette_rounds_eos_block_id_check
  check (eos_block_id is null or eos_block_id ~ '^[0-9a-f]{64}$');

drop index if exists public.idx_mm2wild_roulette_rounds_seed_nonce;

create index idx_mm2wild_roulette_rounds_seed_nonce
  on public.mm2wild_roulette_rounds (seed_id, nonce);

create index if not exists idx_mm2wild_roulette_rounds_eos_block
  on public.mm2wild_roulette_rounds (eos_block_num desc);
