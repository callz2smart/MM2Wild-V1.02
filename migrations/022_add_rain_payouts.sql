alter table public.mm2wild_rain_entries
  add column if not exists payout numeric(20, 2) not null default 0;

alter table public.mm2wild_rain_entries
  drop constraint if exists mm2wild_rain_entries_payout_check;
alter table public.mm2wild_rain_entries
  add constraint mm2wild_rain_entries_payout_check check (payout >= 0);

create or replace function public.mm2wild_settle_rain(p_rain_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rain public.mm2wild_rains%rowtype;
  v_participant_count integer;
  v_total_cents numeric;
  v_base_cents numeric;
  v_extra_cents integer;
  v_payout numeric(20, 2);
  v_entry record;
  v_payouts jsonb := '[]'::jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('mm2wild_rain_' || p_rain_id::text));

  select * into v_rain
    from public.mm2wild_rains
   where id = p_rain_id
   for update;

  if v_rain.id is null then
    raise exception using errcode = 'P0001', message = 'Rain not found.';
  end if;

  if v_rain.status in ('cooldown', 'completed') then
    select coalesce(jsonb_agg(jsonb_build_object(
      'userUuid', user_uuid,
      'name', username,
      'robloxUserId', roblox_user_id,
      'payout', payout
    ) order by joined_at, user_uuid), '[]'::jsonb)
      into v_payouts
      from public.mm2wild_rain_entries
     where rain_id = p_rain_id;

    return jsonb_build_object(
      'rainId', v_rain.id,
      'pool', v_rain.pool,
      'participantCount', jsonb_array_length(v_payouts),
      'payouts', v_payouts
    );
  end if;

  if v_rain.status <> 'joining' then
    raise exception using errcode = 'P0001', message = 'Rain is not ready to settle.';
  end if;

  select count(*) into v_participant_count
    from public.mm2wild_rain_entries
   where rain_id = p_rain_id;

  if v_participant_count > 0 then
    v_total_cents := trunc(v_rain.pool * 100, 0);
    v_base_cents := floor(v_total_cents / v_participant_count);
    v_extra_cents := mod(v_total_cents, v_participant_count)::integer;

    for v_entry in
      select user_uuid, username, roblox_user_id,
             row_number() over (order by joined_at, user_uuid) as payout_order
        from public.mm2wild_rain_entries
       where rain_id = p_rain_id
       order by joined_at, user_uuid
    loop
      v_payout := (
        v_base_cents
        + case when v_entry.payout_order <= v_extra_cents then 1 else 0 end
      ) / 100;

      update public.mm2wild_users
         set mm2_balance = mm2_balance + v_payout
       where uuid = v_entry.user_uuid;

      if not found then
        raise exception using errcode = 'P0001', message = 'Rain participant account not found.';
      end if;

      update public.mm2wild_rain_entries
         set payout = v_payout
       where rain_id = p_rain_id
         and user_uuid = v_entry.user_uuid;

      v_payouts := v_payouts || jsonb_build_array(jsonb_build_object(
        'userUuid', v_entry.user_uuid,
        'name', v_entry.username,
        'robloxUserId', v_entry.roblox_user_id,
        'payout', v_payout
      ));
    end loop;
  end if;

  update public.mm2wild_rains
     set status = 'cooldown', updated_at = now()
   where id = p_rain_id;

  return jsonb_build_object(
    'rainId', v_rain.id,
    'pool', v_rain.pool,
    'participantCount', v_participant_count,
    'payouts', v_payouts
  );
end;
$$;

revoke all on function public.mm2wild_settle_rain(uuid) from public, anon, authenticated;
grant execute on function public.mm2wild_settle_rain(uuid) to service_role;
