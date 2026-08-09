-- supabase/migrations/xxxxxxxx_add_inventory_tables.sql

create table stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  product_name text not null,      -- snapshotted, same rationale as order_items.product_name
  variant_label text,               -- snapshotted display label, e.g. "Large" or null for no-variant products
  delta integer not null,
  reason text not null check (reason in ('restock', 'damaged', 'correction')),
  created_at timestamptz not null default now()
);

create index idx_stock_adjustments_variant_id on stock_adjustments(variant_id);
create index idx_stock_adjustments_created_at on stock_adjustments(created_at desc);

alter table stock_adjustments enable row level security;

create policy "stock adjustments viewable by admins"
  on stock_adjustments for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'superadmin')
    )
  );

-- Singleton settings row — one shop, one threshold, no need for a
-- full settings table yet, so this stays deliberately minimal.
create table store_settings (
  id boolean primary key default true,   -- always exactly one row, id = true
  low_stock_threshold integer not null default 5,
  constraint store_settings_singleton check (id)
);

insert into store_settings (id, low_stock_threshold) values (true, 5);

alter table store_settings enable row level security;

create policy "store settings viewable by admins"
  on store_settings for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'superadmin')
    )
  );

create policy "store settings manageable by admins"
  on store_settings for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'superadmin')
    )
  );