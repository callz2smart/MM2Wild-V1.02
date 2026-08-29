alter table public.mm2wild_rains
  alter column ends_at set default (now() + interval '58 minutes 30 seconds'),
  alter column join_ends_at set default (now() + interval '60 minutes');

update public.mm2wild_rains
set ends_at = starts_at + interval '58 minutes 30 seconds',
    join_ends_at = starts_at + interval '60 minutes',
    updated_at = now()
where status in ('active', 'joining');
