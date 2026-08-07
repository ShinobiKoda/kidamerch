create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  base_price numeric(10,2) not null,
  category text not null, -- 'apparel', 'accessory', etc.
  anime_series text,
  is_active boolean default true,
  created_at timestamptz default now()
);