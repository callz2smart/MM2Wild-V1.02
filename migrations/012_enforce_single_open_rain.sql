with ranked_open_rains as (
  select
    rain.id,
    row_number() over (
      order by
        (select count(*) from public.mm2wild_rain_entries entries where entries.rain_id = rain.id) desc,
        rain.pool desc,
        rain.starts_at desc,
        rain.id desc
    ) as position
  from public.mm2wild_rains rain
  where rain.status in ('active', 'joining')
)
update public.mm2wild_rains rain
set status = 'completed',
    updated_at = now()
from ranked_open_rains ranked
where rain.id = ranked.id
  and ranked.position > 1;

create unique index if not exists idx_mm2wild_rains_single_open
  on public.mm2wild_rains ((1))
  where status in ('active', 'joining');
