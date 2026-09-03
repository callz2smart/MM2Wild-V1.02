alter table public.mm2wild_roulette_rounds
  drop constraint if exists mm2wild_roulette_rounds_jackpot_values_check;

alter table public.mm2wild_roulette_rounds
  drop column if exists jackpot_balance_after,
  drop column if exists jackpot_green_streak_after,
  drop column if exists jackpot_green_round_ids_after;

alter table public.mm2wild_roulette_rounds
  add column if not exists jackpot_contribution numeric(20, 2) not null default 0,
  add column if not exists jackpot_qualifying_round_ids uuid[] not null default '{}',
  add column if not exists jackpot_triggered boolean not null default false,
  add column if not exists jackpot_pot_amount numeric(20, 2) not null default 0,
  add column if not exists jackpot_paid_amount numeric(20, 2) not null default 0,
  add column if not exists jackpot_processed_at timestamptz;

alter table public.mm2wild_roulette_bets
  add column if not exists jackpot_payout numeric(20, 2) not null default 0;

alter table public.mm2wild_roulette_rounds
  add constraint mm2wild_roulette_rounds_jackpot_values_check check (
    jackpot_contribution >= 0
    and jackpot_pot_amount >= 0
    and jackpot_paid_amount >= 0
  );

alter table public.mm2wild_roulette_bets
  drop constraint if exists mm2wild_roulette_bets_jackpot_payout_check;

alter table public.mm2wild_roulette_bets
  add constraint mm2wild_roulette_bets_jackpot_payout_check
  check (jackpot_payout >= 0);

create index if not exists idx_mm2wild_roulette_rounds_jackpot_processed
  on public.mm2wild_roulette_rounds (jackpot_processed_at desc)
  where jackpot_processed_at is not null;

create or replace function public.mm2wild_place_roulette_wager(
  p_user_uuid uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount numeric(20, 2);
  v_balance numeric(20, 2);
begin
  v_amount := round(p_amount, 2);
  if v_amount is null or v_amount <= 0 or v_amount <> p_amount then
    raise exception using errcode = 'P0001', message = 'Enter a valid wager amount.';
  end if;

  update public.mm2wild_users
     set mm2_balance = mm2_balance - v_amount,
         total_wagered = total_wagered + v_amount
   where uuid = p_user_uuid
     and mm2_balance >= v_amount
  returning mm2_balance into v_balance;

  if v_balance is null then
    raise exception using errcode = 'P0001', message = 'Insufficient balance.';
  end if;

  return jsonb_build_object('balance', v_balance);
end;
$$;

create or replace function public.mm2wild_get_roulette_jackpot()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_amount numeric(20, 2);
  v_last_non_green_at timestamptz;
  v_consecutive_greens bigint;
begin
  select coalesce(sum(jackpot_contribution), 0)
    into v_amount
    from public.mm2wild_roulette_rounds
   where jackpot_processed_at is not null;

  select v_amount - coalesce(sum(jackpot_payout), 0)
    into v_amount
    from public.mm2wild_roulette_bets;

  select max(created_at)
    into v_last_non_green_at
    from public.mm2wild_roulette_rounds
   where jackpot_processed_at is not null
     and result <> 'green';

  select count(*)
    into v_consecutive_greens
    from public.mm2wild_roulette_rounds
   where jackpot_processed_at is not null
     and result = 'green'
     and (v_last_non_green_at is null or created_at > v_last_non_green_at);

  return jsonb_build_object(
    'amount', greatest(v_amount, 0),
    'greenStreak', mod(v_consecutive_greens, 3)
  );
end;
$$;

create or replace function public.mm2wild_process_roulette_jackpot(
  p_round_id uuid,
  p_green_bets jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_round public.mm2wild_roulette_rounds%rowtype;
  v_state jsonb;
  v_contribution numeric(20, 2);
  v_balance numeric(20, 2);
  v_green_streak smallint;
  v_qualifying_round_ids uuid[] := '{}'::uuid[];
  v_round_id uuid;
  v_round_green_wager numeric(20, 2);
  v_pot_amount numeric(20, 2) := 0;
  v_paid_amount numeric(20, 2) := 0;
  v_payout numeric(20, 2);
  v_entry record;
  v_payouts jsonb := '[]'::jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('mm2wild_roulette_triple_green_jackpot'));

  select * into v_round
    from public.mm2wild_roulette_rounds
   where id = p_round_id
   for update;

  if v_round.id is null or v_round.result is null then
    raise exception using errcode = 'P0001', message = 'Completed roulette round not found.';
  end if;

  if v_round.jackpot_processed_at is not null then
    if v_round.jackpot_triggered then
      select coalesce(jsonb_agg(jsonb_build_object(
        'userUuid', user_uuid,
        'roundId', round_id,
        'payout', jackpot_payout
      )), '[]'::jsonb)
        into v_payouts
        from public.mm2wild_roulette_bets
       where round_id = any(v_round.jackpot_qualifying_round_ids)
         and jackpot_payout > 0;
    end if;

    v_state := public.mm2wild_get_roulette_jackpot();
    return v_state || jsonb_build_object(
      'triggered', v_round.jackpot_triggered,
      'potAmount', v_round.jackpot_pot_amount,
      'paidAmount', v_round.jackpot_paid_amount,
      'payouts', v_payouts
    );
  end if;

  v_state := public.mm2wild_get_roulette_jackpot();
  v_contribution := round(v_round.total_pot * 0.005, 2);
  v_balance := (v_state->>'amount')::numeric + v_contribution;
  v_green_streak := (v_state->>'greenStreak')::smallint;

  if v_round.result = 'green' then
    v_green_streak := v_green_streak + 1;
  else
    v_green_streak := 0;
  end if;

  if v_green_streak = 3 then
    select coalesce(array_agg(id order by created_at, id), '{}'::uuid[])
      into v_qualifying_round_ids
      from (
        select id, created_at
          from public.mm2wild_roulette_rounds
         where jackpot_processed_at is not null
           and result = 'green'
         order by created_at desc, id desc
         limit 2
      ) recent_green_rounds;
    v_qualifying_round_ids := array_append(v_qualifying_round_ids, p_round_id);
    v_pot_amount := v_balance;

    foreach v_round_id in array v_qualifying_round_ids loop
      select coalesce(sum(amount), 0)
        into v_round_green_wager
        from public.mm2wild_roulette_bets
       where round_id = v_round_id
         and color = 'green';

      if v_round_green_wager > 0 then
        for v_entry in
          select user_uuid, sum(amount) as green_wager
            from public.mm2wild_roulette_bets
           where round_id = v_round_id
             and color = 'green'
           group by user_uuid
        loop
          v_payout := trunc((v_pot_amount / 3) * (v_entry.green_wager / v_round_green_wager), 2);
          if v_payout > 0 then
            update public.mm2wild_users
               set mm2_balance = mm2_balance + v_payout
             where uuid = v_entry.user_uuid;

            update public.mm2wild_roulette_bets
               set jackpot_payout = v_payout
             where id = (
               select id
                 from public.mm2wild_roulette_bets
                where round_id = v_round_id
                  and user_uuid = v_entry.user_uuid
                  and color = 'green'
                order by created_at, id
                limit 1
             );

            v_paid_amount := v_paid_amount + v_payout;
            v_payouts := v_payouts || jsonb_build_array(jsonb_build_object(
              'userUuid', v_entry.user_uuid,
              'roundId', v_round_id,
              'payout', v_payout
            ));
          end if;
        end loop;
      end if;
    end loop;

    v_balance := greatest(v_pot_amount - v_paid_amount, 0);
    v_green_streak := 0;
  end if;

  update public.mm2wild_roulette_rounds
     set jackpot_contribution = v_contribution,
         jackpot_qualifying_round_ids = v_qualifying_round_ids,
         jackpot_triggered = cardinality(v_qualifying_round_ids) = 3,
         jackpot_pot_amount = v_pot_amount,
         jackpot_paid_amount = v_paid_amount,
         jackpot_processed_at = now()
   where id = p_round_id
  returning * into v_round;

  return jsonb_build_object(
    'amount', v_balance,
    'greenStreak', v_green_streak,
    'triggered', v_round.jackpot_triggered,
    'potAmount', v_round.jackpot_pot_amount,
    'paidAmount', v_round.jackpot_paid_amount,
    'payouts', v_payouts
  );
end;
$$;

revoke all on function public.mm2wild_get_roulette_jackpot() from public, anon, authenticated;
grant execute on function public.mm2wild_get_roulette_jackpot() to service_role;
revoke all on function public.mm2wild_process_roulette_jackpot(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.mm2wild_process_roulette_jackpot(uuid, jsonb) to service_role;
revoke all on function public.mm2wild_place_roulette_wager(uuid, numeric) from public, anon, authenticated;
grant execute on function public.mm2wild_place_roulette_wager(uuid, numeric) to service_role;
