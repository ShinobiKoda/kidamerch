import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  EmptyState,
  Panel,
  StatusBadge,
  TableSkeleton,
  btnGhost,
  inputCls,
} from "@/components/admin/parts";
import { formatPrice } from "@/data/products";
import { useAdminOrders, useAdvanceOrder } from "@/hooks/admin/useAdminOrders";
import type { Order, OrderStatus } from "@/types/admin";

export const Route = createFileRoute("/admin/orders/")({
  component: OrdersPage,
});

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

// DB stores lowercase status/payment values — UI shows Title Case.
function statusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const PER_PAGE = 10;

function OrdersPage() {
  const { data: orders = [], isLoading } = useAdminOrders();
  const advanceOrder = useAdvanceOrder();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = orders.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (q === "" ||
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)),
    );
    const sorted = [...list];
    if (sort === "newest") sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (sort === "oldest") sorted.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    if (sort === "total") sorted.sort((a, b) => b.total - a.total);
    return sorted;
  }, [orders, query, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const counts = STATUSES.map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));

  const canAdvance = (s: OrderStatus) => ["pending", "processing", "shipped"].includes(s);

  return (
    <AdminShell
      title="Orders"
      description="Orders placed through the storefront. Advance fulfilment or open an order for the full timeline."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatus("all")}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            status === "all" ? "border-primary bg-primary/10 text-primary" : "border-border"
          }`}
        >
          All {orders.length}
        </button>
        {counts.map(({ s, n }) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              status === s ? "border-primary bg-primary/10 text-primary" : "border-border"
            }`}
          >
            {statusLabel(s)} {n}
          </button>
        ))}
      </div>

      <Panel>
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="relative min-w-50 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by order ID, name or email"
              className={`${inputCls} pl-9`}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={`${inputCls} w-auto`}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="total">Highest total</option>
          </select>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No orders found"
            body="Adjust the filters, or place an order through the storefront checkout to see it land here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-205 text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Order", "Customer", "Date", "Items", "Total", "Payment", "Status", ""].map(
                    (h) => (
                      <th key={h} className="px-3 py-3 text-xs font-semibold text-muted-foreground">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((o: Order) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-3 py-3">
                      <Link
                        to="/admin/orders/$id"
                        params={{ id: o.id }}
                        className="font-semibold tabular-nums hover:text-primary"
                      >
                        {o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{o.customerName || "Guest"}</p>
                      <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {o.items.reduce((n, i) => n + i.quantity, 0)}
                    </td>
                    <td className="px-3 py-3 font-semibold tabular-nums">{formatPrice(o.total)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={statusLabel(o.paymentStatus)} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={statusLabel(o.status)} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      {canAdvance(o.status) && (
                        <button
                          type="button"
                          onClick={async () => {
                            await advanceOrder.mutateAsync(o);
                            toast.success("Order advanced");
                          }}
                          className="text-xs font-semibold text-primary"
                        >
                          Advance
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {filtered.length} orders · page {current} of {pages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
                className={btnGhost}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
                className={btnGhost}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Panel>
    </AdminShell>
  );
}