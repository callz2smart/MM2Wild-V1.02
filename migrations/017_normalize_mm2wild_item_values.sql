alter table public.mm2wild_items
  alter column value type numeric
  using trim_scale(
    case
      when value >= 1 then round(value)
      else value
    end
  );

update public.mm2wild_items
set value = trim_scale(value);

alter table public.mm2wild_items
  drop constraint if exists mm2wild_items_value_format_check;

alter table public.mm2wild_items
  add constraint mm2wild_items_value_format_check
  check (value < 1 or value = trunc(value));
