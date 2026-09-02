do $migration$
begin
  if to_regclass('public.mm2wild_roulette_bets') is null
    and to_regclass('public.mm2wild_roulette_games') is not null then
    alter table public.mm2wild_roulette_games rename to mm2wild_roulette_bets;
  end if;
end
$migration$;

alter index if exists public.idx_mm2wild_roulette_games_user_created
  rename to idx_mm2wild_roulette_bets_user_created;

alter index if exists public.idx_mm2wild_roulette_games_round
  rename to idx_mm2wild_roulette_bets_round;

alter table public.mm2wild_roulette_bets enable row level security;
revoke all on table public.mm2wild_roulette_bets from anon, authenticated;
