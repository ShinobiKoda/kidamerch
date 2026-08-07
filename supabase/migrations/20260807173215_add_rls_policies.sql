alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Catalog: public read
create policy "Public read products" on products
  for select using (is_active = true);
create policy "Public read variants" on product_variants
  for select using (true);
create policy "Public read images" on product_images
  for select using (true);

-- Profiles: only owner
create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id);

-- Orders: anyone can create, only owner (or unauthenticated lookup) can view
create policy "Anyone can create an order" on orders
  for insert with check (true);
create policy "Users view own orders" on orders
  for select using (auth.uid() = user_id or user_id is null);

-- Order items: insert freely, visibility follows parent order
create policy "Anyone can insert order items" on order_items
  for insert with check (true);
create policy "Order items follow order visibility" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or orders.user_id is null)
    )
  );