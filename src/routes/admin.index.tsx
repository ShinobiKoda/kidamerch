import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, PackagePlus, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { EASE } from "@/components/Reveal";
import {
  EmptyState,
  Panel,
  PanelHead,
  StatusBadge,
  btnGhost,
  btnPrimary,
} from "@/components/admin/parts";
import { formatPrice } from "@/data/products";
import { useAdminProducts } from "@/hooks/admin/useAdminProducts";
import { useAdminOrders, STATUS_LABEL } from "@/hooks/admin/useAdminOrders";
import { useAdminEvents } from "@/hooks/admin/useAdminEvents";
import { useAdminCategories } from "@/hooks/admin/useAdminCategories";
import { useStoreSettings } from "@/hooks/admin/useAdminSettings";
import { useAdminInsights } from "@/hooks/admin/useAdminInsights";
import type { Product } from "@/types/storefront";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const CLOSED_STATUSES = new Set(["cancelled", "refunded"]);

function Kpi({
  label,
  value,
  delta,
  index,
}: {
  label: string;
  value: string;
  delta: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.06 }}
      className="rounded-md border border-border bg-surface p-5 shadow-elevate"
    >
      <p className="eyebrow text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowUpRight size={13} className="text-emerald-500" />
        {delta}
      </p>
    </motion.div>
  );
}

// Real products don't carry a single top-level stock number — stock lives per variant.
function totalStock(product: Product): number {
  return product.variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0;
}

function Dashboard() {
  const { data: products = [], isLoading: productsLoading, isError: productsError } =
    useAdminProducts();
  const { data: orders = [], isLoading: ordersLoading, isError: ordersError } = useAdminOrders();
  const { data: events = [], isLoading: eventsLoading } = useAdminEvents();
  const { data: categoryRows = [], isLoading: categoriesLoading } = useAdminCategories();
  const { data: storeSettings } = useStoreSettings();
  const lowStockThreshold = storeSettings?.lowStockThreshold ?? 5;

  const [range, setRange] = useState<7 | 30>(7);
  const { data: insights, isLoading: insightsLoading } = useAdminInsights(range);
  const series = insights?.series ?? [];

  const paid = useMemo(
    () => orders.filter((o) => !CLOSED_STATUSES.has(o.status)),
    [orders],
  );
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const aov = paid.length ? revenue / paid.length : 0;

  const lowStock = useMemo(
    () => products.filter((p) => totalStock(p) <= lowStockThreshold),
    [products, lowStockThreshold],
  );
  const upcoming = events.filter((e) => e.status === "Upcoming").length;

  // Order items only carry variantId/productName, not category — so category
  // revenue is derived by matching each item's variantId back to the product
  // that owns that variant, via the currently-loaded product list.
  const variantToProduct = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) {
      for (const v of p.variants ?? []) map.set(v.id, p);
    }
    return map;
  }, [products]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of paid) {
      for (const it of o.items) {
        const category = variantToProduct.get(it.variantId)?.category ?? "Other";
        map.set(category, (map.get(category) ?? 0) + it.priceAtOrder * it.quantity);
      }
    }
    return Array.from(map, ([name, revenue]) => ({ name, revenue })).sort(
      (a, b) => b.revenue - a.revenue,
    );
  }, [paid, variantToProduct]);

  const recent = useMemo(
    () =>
      [...orders]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 6),
    [orders],
  );

  const avgPrice = products.length
    ? products.reduce((s, p) => s + p.basePrice, 0) / products.length
    : 0;

  const activeCount = products.filter((p) => p.isActive).length;
  const draftCount = products.filter((p) => !p.isActive).length;
  const outOfStockCount = products.filter((p) => totalStock(p) === 0).length;

  const snapshot: { label: string; value: string }[] = [
    { label: "Products", value: String(products.length) },
    { label: "Active", value: String(activeCount) },
    { label: "Drafts", value: String(draftCount) },
    { label: "Out of stock", value: String(outOfStockCount) },
    { label: "Categories", value: categoriesLoading ? "—" : String(categoryRows.length) },
    { label: "Avg. price", value: formatPrice(avgPrice) },
  ];

  const hasError = productsError || ordersError;

  return (
    <AdminShell
      title="Dashboard"
      description="A snapshot of trading performance, catalogue health and what needs attention today."
      actions={
        <>
          <Link to="/admin/products" className={btnPrimary}>
            <PackagePlus size={15} /> New product
          </Link>
          <Link to="/admin/orders" className={btnGhost}>
            View orders
          </Link>
        </>
      }
    >
      {hasError && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn't load some dashboard data. Numbers below may be incomplete.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total revenue"
          value={ordersLoading ? "—" : formatPrice(revenue)}
          delta={`${paid.length} paid orders`}
          index={0}
        />
        <Kpi
          label="Orders"
          value={ordersLoading ? "—" : String(orders.length)}
          delta={`${orders.length - paid.length} cancelled/refunded`}
          index={1}
        />
        <Kpi
          label="Avg. order value"
          value={ordersLoading ? "—" : formatPrice(aov)}
          delta="Across paid orders"
          index={2}
        />
        <Kpi
          label="Active products"
          value={productsLoading ? "—" : String(activeCount)}
          delta={eventsLoading ? "—" : `${upcoming} upcoming events`}
          index={3}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHead
            title="Sales over time"
            action={
              <div className="flex rounded-sm border border-border p-0.5">
                {([7, 30] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`h-7 rounded-[2px] px-3 text-xs font-semibold transition-colors ${
                      range === r
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}d
                  </button>
                ))}
              </div>
            }
          />
          <div className="h-64 px-2 py-4">
            {insightsLoading ? (
              <div className="h-full w-full animate-pulse rounded-sm bg-secondary/50" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    interval="preserveStartEnd"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatPrice(v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#rev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Revenue by category" />
          <div className="h-64 px-2 py-4">
            {ordersLoading || productsLoading ? (
              <div className="h-full w-full animate-pulse rounded-sm bg-secondary/50" />
            ) : byCategory.length === 0 ? (
              <EmptyState title="No sales yet" body="Category revenue appears once orders come in." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatPrice(v)}
                  />
                  <Bar dataKey="revenue" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHead
            title="Recent orders"
            action={
              <Link to="/admin/orders" className="text-xs font-semibold text-primary">
                View all
              </Link>
            }
          />
          {ordersLoading ? (
            <EmptyState title="Loading…" body="Fetching recent orders." />
          ) : recent.length === 0 ? (
            <EmptyState title="No orders yet" body="Orders placed at checkout appear here." />
          ) : (
            <div className="divide-y divide-border">
              {recent.map((o) => (
                <Link
                  key={o.id}
                  to="/admin/orders/$id"
                  params={{ id: o.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3.5 transition-colors hover:bg-secondary/50 sm:flex sm:gap-4"
                >
                  <span className="min-w-0 truncate text-sm sm:order-2 sm:flex-1">
                    {o.customerName}
                  </span>
                  <span className="text-right text-sm font-semibold tabular-nums sm:order-4 sm:w-24 sm:shrink-0">
                    {formatPrice(o.total)}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground sm:order-1 sm:w-20 sm:shrink-0 sm:text-foreground">
                    {o.id.slice(0, 8)}
                  </span>
                  <span className="justify-self-end sm:order-3">
                    <StatusBadge status={STATUS_LABEL[o.status]} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHead
            title="Low stock"
            action={
              <Link to="/admin/inventory" className="text-xs font-semibold text-primary">
                Manage
              </Link>
            }
          />
          {productsLoading ? (
            <EmptyState title="Loading…" body="Fetching current stock levels." />
          ) : lowStock.length === 0 ? (
            <EmptyState title="Stock is healthy" body={`Nothing is at or below ${lowStockThreshold} units.`} />
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <TriangleAlert size={14} className="shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{totalStock(p)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHead
          title="Catalogue snapshot"
          action={
            <Link to="/admin/products" className="text-xs font-semibold text-primary">
              Manage catalogue
            </Link>
          }
        />
        <dl className="grid grid-cols-2 divide-border sm:grid-cols-3 xl:grid-cols-6">
          {snapshot.map((s) => (
            <div key={s.label} className="border-b border-r border-border p-4 last:border-r-0">
              <dt className="eyebrow text-[10px] text-muted-foreground">{s.label}</dt>
              <dd className="mt-2 text-xl font-semibold tracking-tight tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </AdminShell>
  );
}