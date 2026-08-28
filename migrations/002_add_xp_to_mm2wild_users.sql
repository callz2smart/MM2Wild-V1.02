alter table public.mm2wild_users
add column if not exists xp bigint not null default 0 check (xp >= 0);
