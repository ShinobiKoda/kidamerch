-- Revenue by day, zero-filled, for the last N days.
create or replace function public.admin_revenue_series(days_back int)
returns table(day date, revenue numeric)
language sql
stable
as $$
  select
    d::date as day,
    coalesce(sum(o.total_estimate), 0) as revenue
  from generate_series(
    (current_date - (days_back - 1)),
    current_date,
    interval '1 day'
  ) d
  left join public.orders o
    on o.created_at::date = d::date
    and o.status not in ('cancelled', 'refunded')
  group by d
  order by d;
$$;

-- Order count per status, all-time.
create or replace function public.admin_status_mix()
returns table(status text, count bigint)
language sql
stable
as $$
  select status, count(*)::bigint
  from public.orders
  group by status;
$$;

-- Top N products by revenue, excluding cancelled/refunded orders.
create or replace function public.admin_top_products(limit_count int default 8)
returns table(product_name text, units bigint, revenue numeric)
language sql
stable
as $$
  select
    oi.product_name,
    sum(oi.quantity)::bigint as units,
    sum(oi.quantity * oi.price_at_order) as revenue
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.status not in ('cancelled', 'refunded')
  group by oi.product_name
  order by revenue desc
  limit limit_count;
$$;

-- These touch order/revenue data — no client role should be able to call
-- them directly, only the service role via supabaseAdmin.
revoke all on function public.admin_revenue_series(int) from public, anon, authenticated;
revoke all on function public.admin_status_mix() from public, anon, authenticated;
revoke all on function public.admin_top_products(int) from public, anon, authenticated;
grant execute on function public.admin_revenue_series(int) to service_role;
grant execute on function public.admin_status_mix() to service_role;
grant execute on function public.admin_top_products(int) to service_role;

-- Supporting indexes so these aggregations stay fast as the tables grow.
create index if not exists orders_created_at_idx on public.orders (created_at);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_items_order_id_idx on public.order_items (order_id);