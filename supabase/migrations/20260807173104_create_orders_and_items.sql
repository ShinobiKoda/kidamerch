create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id), -- null = guest order
  guest_name text,
  guest_phone text,
  guest_email text,
  status text not null default 'pending', -- pending, contacted, confirmed, fulfilled, cancelled
  total_estimate numeric(10,2) not null,
  notes text,
  whatsapp_sent_at timestamptz,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  product_name text not null,
  variant_details text,
  quantity integer not null default 1,
  price_at_order numeric(10,2) not null,
  created_at timestamptz default now()
);

create index idx_orders_user_id on orders(user_id);
create index idx_order_items_order_id on order_items(order_id);