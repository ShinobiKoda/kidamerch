import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  EmptyState,
  Panel,
  PanelHead,
  StatusBadge,
  TableSkeleton,
  btnSubtle,
  inputCls,
} from "@/components/admin/parts";
import { useAdminProducts } from "@/hooks/admin/useAdminProducts";
import {
  useAdjustStock,
  useStockAdjustments,
  useStoreSettings,
  useSetLowStockThreshold,
  toAdjustmentReason,
} from "@/hooks/admin/useAdminInventory";
import type { Product } from "@/types/storefront";
import type { AdjustmentReason } from "@/types/admin";

export const Route = createFileRoute("/admin/inventory")({
  component: InventoryPage,
});

const REASON_LABELS: Record<AdjustmentReason, string> = {
  restock: "Restock",
  damaged: "Damaged",
  correction: "Correction",
};

function totalStock(p: Product): number {
  return p.variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0;
}

function variantLabel(v: Product["variants"][number]): string | null {
  return v.size || v.color || v.design || null;
}

function InventoryPage() {
  const { data: products = [], isLoading: productsLoading } = useAdminProducts();
  const { data: adjustments = [] } = useStockAdjustments();
  const { data: settings } = useStoreSettings();
  const adjustStock = useAdjustStock();
  const setThreshold = useSetLowStockThreshold();

  const lowStockThreshold = settings?.lowStockThreshold ?? 5;

  const [thresholdDraft, setThresholdDraft] = useState(String(lowStockThreshold));
  const [query, setQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [reasonLabel, setReasonLabel] = useState<string>("Restock");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .filter((p) => !lowOnly || totalStock(p) <= lowStockThreshold)
      .sort((a, b) => totalStock(a) - totalStock(b));
  }, [products, query, lowOnly, lowStockThreshold]);

  const adjust = async (
    variantId: string,
    delta: number,
    productName: string,
    label: string | null,
  ) => {
    try {
      await adjustStock.mutateAsync({
        variantId,
        delta,
        reason: toAdjustmentReason(reasonLabel),
      });
      if (delta > 0) toast.success(`${productName}${label ? ` (${label})` : ""} stock updated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to adjust stock");
    }
  };

  return (
    <AdminShell
      title="Inventory"
      description={`Stock counts per variant. Anything at or below ${lowStockThreshold} units is flagged, and reaching zero flips the product to Out of Stock in the storefront.`}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <div className="relative min-w-45 flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search inventory"
                className={`${inputCls} pl-9`}
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={lowOnly}
                onChange={(e) => setLowOnly(e.target.checked)}
              />
              Low stock only
            </label>
            <select
              value={reasonLabel}
              onChange={(e) => setReasonLabel(e.target.value)}
              className={`${inputCls} w-auto`}
              aria-label="Adjustment reason"
            >
              {Object.values(REASON_LABELS).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <span className="whitespace-nowrap text-muted-foreground">Low stock at</span>
              <input
                type="number"
                min={1}
                max={999}
                value={thresholdDraft}
                onChange={(e) => setThresholdDraft(e.target.value)}
                onBlur={async () => {
                  const n = Number(thresholdDraft);
                  if (!Number.isFinite(n) || n < 1) {
                    setThresholdDraft(String(lowStockThreshold));
                    return;
                  }
                  const next = Math.max(1, Math.min(999, Math.round(n)));
                  setThresholdDraft(String(next));
                  if (next !== lowStockThreshold) {
                    try {
                      await setThreshold.mutateAsync(next);
                      toast.success(`Low stock alerts now trigger at ${next} units`);
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Failed to save threshold");
                    }
                  }
                }}
                className={`${inputCls} w-20 tabular-nums`}
                aria-label="Low stock threshold"
              />
            </label>
          </div>

          {productsLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState title="Nothing to show" body="No products match this filter." />
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((p) => {
                const stock = totalStock(p);
                const variants = p.variants ?? [];
                return (
                  <li key={p.id} className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {p.images?.[0]?.url && (
                          <img
                            src={p.images[0].url}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-sm object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold tracking-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.category}</p>
                        </div>
                      </div>
                      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                        {stock === 0 ? (
                          <StatusBadge status="Out of Stock" />
                        ) : stock <= lowStockThreshold ? (
                          <StatusBadge status="Low stock" />
                        ) : (
                          <StatusBadge status="Active" />
                        )}
                        <span className="text-sm font-semibold tabular-nums sm:w-14 sm:text-right">
                          {stock} <span className="text-xs text-muted-foreground">in stock</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const label = variantLabel(v);
                        return (
                          <div
                            key={v.id}
                            className="flex items-center gap-1.5 rounded-sm border border-border bg-surface-2 px-2 py-1.5"
                          >
                            {label && (
                              <span className="min-w-8 text-xs font-semibold text-muted-foreground">
                                {label}
                              </span>
                            )}
                            <button
                              type="button"
                              aria-label={`Decrease ${p.name} ${label ?? ""}`}
                              className={btnSubtle}
                              disabled={adjustStock.isPending}
                              onClick={() => adjust(v.id, -1, p.name, label)}
                            >
                              <Minus size={13} />
                            </button>
                            <span className="flex h-7 w-12 items-center justify-center rounded-sm border border-input bg-surface text-center text-xs tabular-nums">
                              {v.stock ?? 0}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase ${p.name} ${label ?? ""}`}
                              className={btnSubtle}
                              disabled={adjustStock.isPending}
                              onClick={() => adjust(v.id, 1, p.name, label)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelHead title="Adjustment history" />
          {adjustments.length === 0 ? (
            <EmptyState
              title="No adjustments yet"
              body="Stock changes made here are logged with a reason."
            />
          ) : (
            <ul className="divide-y divide-border">
              {adjustments.slice(0, 14).map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium">{a.productName}</p>
                    <span
                      className={`shrink-0 text-sm font-semibold tabular-nums ${
                        a.delta > 0 ? "text-emerald-500" : "text-primary"
                      }`}
                    >
                      {a.delta > 0 ? "+" : ""}
                      {a.delta}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.variantLabel ?? "—"} · {REASON_LABELS[a.reason]} ·{" "}
                    {new Date(a.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}