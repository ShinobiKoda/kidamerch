-- supabase/migrations/xxxxxxxx_expand_orders_schema.sql

-- Payment tracking, shipping, price breakdown, tracking number, cancellation reason
alter table orders add column payment_status text not null default 'pending';
alter table orders add column shipping_address text;
alter table orders add column tracking_number text;
alter table orders add column subtotal numeric(10,2);
alter table orders add column shipping_cost numeric(10,2) not null default 0;
alter table orders add column tax numeric(10,2) not null default 0;
alter table orders add column reason text; -- cancellation/refund reason

-- Enforce a real vocabulary now that one doesn't exist yet
alter table orders add constraint orders_status_check
  check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));

alter table orders add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'refunded'));

-- Timeline as an append-only event log, not a mutated array column
create table order_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  label text not null,
  at timestamptz not null default now()
);

create index idx_order_history_order_id on order_history(order_id);

-- Seed a "Placed" event for any orders that already exist, so the
-- timeline isn't empty for pre-migration data
insert into order_history (order_id, label, at)
select id, 'Order placed', created_at from orders;

alter table order_history enable row level security;

create policy "order history viewable by admins"
  on order_history for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'superadmin')
    )
  );