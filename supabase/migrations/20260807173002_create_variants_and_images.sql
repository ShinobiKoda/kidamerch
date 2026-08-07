create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text,
  color text,
  design text,
  sku text unique,
  price_override numeric(10,2),
  stock integer not null default 0,
  created_at timestamptz default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade, -- null = shared across variants
  url text not null,
  position integer default 0
);

create index idx_variants_product_id on product_variants(product_id);
create index idx_images_product_id on product_images(product_id);
create index idx_images_variant_id on product_images(variant_id);