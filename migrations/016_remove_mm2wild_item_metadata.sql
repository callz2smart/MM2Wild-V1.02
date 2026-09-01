alter table public.mm2wild_items
  drop constraint if exists mm2wild_items_name_rarity_key;

alter table public.mm2wild_items
  drop constraint if exists mm2wild_items_name_rarity_item_type_key;

alter table public.mm2wild_items
  drop constraint if exists mm2wild_items_source_key_key;

alter table public.mm2wild_items
  drop column if exists item_type cascade,
  drop column if exists source_key cascade,
  drop column if exists source_commit cascade;

