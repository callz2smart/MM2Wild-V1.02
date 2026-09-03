create or replace function public.mm2wild_fill_user_identity_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select username, roblox_user_id
    into new.username, new.roblox_user_id
    from public.mm2wild_users
   where uuid = new.user_uuid;

  if new.username is null or new.roblox_user_id is null then
    raise exception using errcode = 'P0001', message = 'User identity not found.';
  end if;

  return new;
end;
$$;

create or replace function public.mm2wild_fill_tip_identity_snapshots()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select username, roblox_user_id
    into new.sender_username, new.sender_roblox_user_id
    from public.mm2wild_users
   where uuid = new.sender_uuid;

  select username, roblox_user_id
    into new.recipient_username, new.recipient_roblox_user_id
    from public.mm2wild_users
   where uuid = new.recipient_uuid;

  if new.sender_username is null or new.sender_roblox_user_id is null
     or new.recipient_username is null or new.recipient_roblox_user_id is null then
    raise exception using errcode = 'P0001', message = 'Tip user identity not found.';
  end if;

  return new;
end;
$$;

alter table public.mm2wild_roulette_bets
  add column if not exists username text,
  add column if not exists roblox_user_id bigint;

alter table public.mm2wild_rain_entries
  add column if not exists username text,
  add column if not exists roblox_user_id bigint;

alter table public.mm2wild_bets
  add column if not exists username text,
  add column if not exists roblox_user_id bigint;

alter table public.mm2wild_transactions
  add column if not exists username text,
  add column if not exists roblox_user_id bigint;

alter table public.mm2wild_sessions
  add column if not exists username text,
  add column if not exists roblox_user_id bigint;

alter table public.mm2wild_fairness
  add column if not exists username text,
  add column if not exists roblox_user_id bigint;

alter table public.mm2wild_affiliates
  add column if not exists username text,
  add column if not exists roblox_user_id bigint;

alter table public.mm2wild_tips
  add column if not exists sender_username text,
  add column if not exists sender_roblox_user_id bigint,
  add column if not exists recipient_username text,
  add column if not exists recipient_roblox_user_id bigint;

update public.mm2wild_roulette_bets records
   set username = users.username,
       roblox_user_id = users.roblox_user_id
  from public.mm2wild_users users
 where users.uuid = records.user_uuid
   and (records.username is null or records.roblox_user_id is null);

update public.mm2wild_rain_entries records
   set username = users.username,
       roblox_user_id = users.roblox_user_id
  from public.mm2wild_users users
 where users.uuid = records.user_uuid
   and (records.username is null or records.roblox_user_id is null);

update public.mm2wild_bets records
   set username = users.username,
       roblox_user_id = users.roblox_user_id
  from public.mm2wild_users users
 where users.uuid = records.user_uuid
   and (records.username is null or records.roblox_user_id is null);

update public.mm2wild_transactions records
   set username = users.username,
       roblox_user_id = users.roblox_user_id
  from public.mm2wild_users users
 where users.uuid = records.user_uuid
   and (records.username is null or records.roblox_user_id is null);

update public.mm2wild_sessions records
   set username = users.username,
       roblox_user_id = users.roblox_user_id
  from public.mm2wild_users users
 where users.uuid = records.user_uuid
   and (records.username is null or records.roblox_user_id is null);

update public.mm2wild_fairness records
   set username = users.username,
       roblox_user_id = users.roblox_user_id
  from public.mm2wild_users users
 where users.uuid = records.user_uuid
   and (records.username is null or records.roblox_user_id is null);

update public.mm2wild_affiliates records
   set username = users.username,
       roblox_user_id = users.roblox_user_id
  from public.mm2wild_users users
 where users.uuid = records.user_uuid
   and (records.username is null or records.roblox_user_id is null);

update public.mm2wild_tips records
   set sender_username = sender.username,
       sender_roblox_user_id = sender.roblox_user_id,
       recipient_username = recipient.username,
       recipient_roblox_user_id = recipient.roblox_user_id
  from public.mm2wild_users sender,
       public.mm2wild_users recipient
 where sender.uuid = records.sender_uuid
   and recipient.uuid = records.recipient_uuid
   and (
     records.sender_username is null
     or records.sender_roblox_user_id is null
     or records.recipient_username is null
     or records.recipient_roblox_user_id is null
   );

alter table public.mm2wild_roulette_bets
  alter column username set not null,
  alter column roblox_user_id set not null;
alter table public.mm2wild_rain_entries
  alter column username set not null,
  alter column roblox_user_id set not null;
alter table public.mm2wild_bets
  alter column username set not null,
  alter column roblox_user_id set not null;
alter table public.mm2wild_transactions
  alter column username set not null,
  alter column roblox_user_id set not null;
alter table public.mm2wild_sessions
  alter column username set not null,
  alter column roblox_user_id set not null;
alter table public.mm2wild_fairness
  alter column username set not null,
  alter column roblox_user_id set not null;
alter table public.mm2wild_affiliates
  alter column username set not null,
  alter column roblox_user_id set not null;
alter table public.mm2wild_tips
  alter column sender_username set not null,
  alter column sender_roblox_user_id set not null,
  alter column recipient_username set not null,
  alter column recipient_roblox_user_id set not null;

drop trigger if exists mm2wild_roulette_bets_fill_identity on public.mm2wild_roulette_bets;
create trigger mm2wild_roulette_bets_fill_identity
before insert or update on public.mm2wild_roulette_bets
for each row execute function public.mm2wild_fill_user_identity_snapshot();

drop trigger if exists mm2wild_rain_entries_fill_identity on public.mm2wild_rain_entries;
create trigger mm2wild_rain_entries_fill_identity
before insert or update on public.mm2wild_rain_entries
for each row execute function public.mm2wild_fill_user_identity_snapshot();

drop trigger if exists mm2wild_bets_fill_identity on public.mm2wild_bets;
create trigger mm2wild_bets_fill_identity
before insert or update on public.mm2wild_bets
for each row execute function public.mm2wild_fill_user_identity_snapshot();

drop trigger if exists mm2wild_transactions_fill_identity on public.mm2wild_transactions;
create trigger mm2wild_transactions_fill_identity
before insert or update on public.mm2wild_transactions
for each row execute function public.mm2wild_fill_user_identity_snapshot();

drop trigger if exists mm2wild_sessions_fill_identity on public.mm2wild_sessions;
create trigger mm2wild_sessions_fill_identity
before insert or update on public.mm2wild_sessions
for each row execute function public.mm2wild_fill_user_identity_snapshot();

drop trigger if exists mm2wild_fairness_fill_identity on public.mm2wild_fairness;
create trigger mm2wild_fairness_fill_identity
before insert or update on public.mm2wild_fairness
for each row execute function public.mm2wild_fill_user_identity_snapshot();

drop trigger if exists mm2wild_affiliates_fill_identity on public.mm2wild_affiliates;
create trigger mm2wild_affiliates_fill_identity
before insert or update on public.mm2wild_affiliates
for each row execute function public.mm2wild_fill_user_identity_snapshot();

drop trigger if exists mm2wild_tips_fill_identities on public.mm2wild_tips;
create trigger mm2wild_tips_fill_identities
before insert or update on public.mm2wild_tips
for each row execute function public.mm2wild_fill_tip_identity_snapshots();

revoke all on function public.mm2wild_fill_user_identity_snapshot() from public, anon, authenticated;
revoke all on function public.mm2wild_fill_tip_identity_snapshots() from public, anon, authenticated;
