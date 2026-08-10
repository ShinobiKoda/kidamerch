import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Minus, Plus, RotateCcw, Save, Search } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  EmptyState,
  Panel,
  PanelHead,
  StatusBadge,
  TableSkeleton,
  btnPrimary,
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

/** Map of variantId → accumulated delta from +/- clicks */
type DraftDeltas = Record<string, number>;

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

  // --- Batched stock editing state ---
  const [drafts, setDrafts] = useState<DraftDeltas>({});
  const [saving, setSaving] = useState<Set<string>>(new Set()); // variantIds currently being saved
  const savingRef = useRef(saving); // ref to avoid stale closures
  savingRef.current = saving;

  const hasDrafts = Object.keys(drafts).length > 0;

  const changeDelta = useCallback((variantId: string, change: number) => {
    setDrafts((prev) => {
      const next = { ...prev };
      const current = next[variantId] ?? 0;
      const updated = current + change;
      if (updated === 0) {
        delete next[variantId];
      } else {
        next[variantId] = updated;
      }
      return next;
    });
  }, []);

  const resetDraft = useCallback((variantId: string) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  }, []);

  const resetAllDrafts = useCallback(() => {
    setDrafts({});
  }, []);

  // Which product IDs have pending drafts?
  const productDraftMap = useMemo(() => {
    const map = new Map<string, string[]>(); // productId → variantIds
    for (const product of products) {
      const variantIds = (product.variants ?? [])
        .filter((v) => drafts[v.id] !== undefined)
        .map((v) => v.id);
      if (variantIds.length > 0) {
        map.set(product.id, variantIds);
      }
    }
    return map;
  }, [products, drafts]);

  const saveVariants = useCallback(
    async (variantIds: string[], productName: string) => {
      // Filter out any that are already being saved (prevent double-submit / race)
      const toSave = variantIds.filter((id) => !savingRef.current.has(id));
      if (toSave.length === 0) return;

      // Snapshot the deltas now to avoid stale reads if user keeps clicking
      const deltas = toSave.map((id) => ({ variantId: id, delta: drafts[id] ?? 0 })).filter((d) => d.delta !== 0);
      if (deltas.length === 0) return;

      setSaving((prev) => {
        const next = new Set(prev);
        for (const id of toSave) next.add(id);
        return next;
      });

      const reason = toAdjustmentReason(reasonLabel);
      let successCount = 0;
      let errorCount = 0;

      // Send each variant adjustment sequentially to avoid DB race conditions
      for (const { variantId, delta } of deltas) {
        try {
          await adjustStock.mutateAsync({ variantId, delta, reason });
          successCount++;
          // Clear only the successfully saved draft
          setDrafts((prev) => {
            const next = { ...prev };
            delete next[variantId];
            return next;
          });
        } catch {
          errorCount++;
        } finally {
          setSaving((prev) => {
            const next = new Set(prev);
            next.delete(variantId);
            return next;
          });
        }
      }

      if (successCount > 0 && errorCount === 0) {
        toast.success(`${productName} stock updated`, {
          description: `${successCount} variant${successCount > 1 ? "s" : ""} adjusted`,
        });
      } else if (errorCount > 0) {
        toast.error(`${errorCount} adjustment${errorCount > 1 ? "s" : ""} failed for ${productName}`);
      }
    },
    [drafts, reasonLabel, adjustStock],
  );

  const saveAll = useCallback(async () => {
    const entries = Array.from(productDraftMap.entries());
    if (entries.length === 0) return;

    // Find product names for toasts
    const nameMap = new Map(products.map((p) => [p.id, p.name]));

    for (const [productId, variantIds] of entries) {
      await saveVariants(variantIds, nameMap.get(productId) ?? "Product");
    }
  }, [productDraftMap, products, saveVariants]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .filter((p) => !lowOnly || totalStock(p) <= lowStockThreshold)
      .sort((a, b) => totalStock(a) - totalStock(b));
  }, [products, query, lowOnly, lowStockThreshold]);

  const isSavingAny = saving.size > 0;

  return (
    <AdminShell
      title="Inventory"
      description={`Stock counts per variant. Anything at or below ${lowStockThreshold} units is flagged, and reaching zero flips the product to Out of Stock in the storefront.`}
    >
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <Panel className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="relative min-w-56 flex-1">
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

          {/* Global action bar — visible when there are pending changes */}
          {hasDrafts && (
            <div className="flex items-center justify-between border-b border-border bg-surface-2/50 px-5 py-3">
              <p className="text-xs font-medium text-muted-foreground">
                {Object.keys(drafts).length} unsaved change{Object.keys(drafts).length > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className={btnSubtle}
                  onClick={resetAllDrafts}
                  disabled={isSavingAny}
                >
                  <RotateCcw size={13} /> Reset all
                </button>
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={saveAll}
                  disabled={isSavingAny}
                >
                  {isSavingAny ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {isSavingAny ? "Saving…" : "Save all changes"}
                </button>
              </div>
            </div>
          )}

          {productsLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState title="Nothing to show" body="No products match this filter." />
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((p) => {
                const stock = totalStock(p);
                const variants = p.variants ?? [];
                const productHasDrafts = productDraftMap.has(p.id);
                const productVariantIds = productDraftMap.get(p.id) ?? [];
                const isProductSaving = productVariantIds.some((id) => saving.has(id));

                return (
                  <li key={p.id} className="px-5 py-5">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-3.5">
                        {p.images?.[0]?.url && (
                          <img
                            src={p.images[0].url}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-md object-cover"
                          />
                        )}
                        <div className="min-w-0 space-y-0.5">
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
                        <span className="text-sm font-semibold tabular-nums sm:w-16 sm:text-right">
                          {stock} <span className="text-xs text-muted-foreground">in stock</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-border/50 pt-3.5">
                      {variants.map((v) => {
                        const label = variantLabel(v);
                        const delta = drafts[v.id] ?? 0;
                        const displayStock = (v.stock ?? 0) + delta;
                        const isVariantSaving = saving.has(v.id);

                        return (
                          <div
                            key={v.id}
                            className={`flex items-center gap-2 rounded-md border px-2.5 py-2 transition-colors ${
                              delta !== 0
                                ? "border-primary/40 bg-primary/5"
                                : "border-border bg-surface-2"
                            }`}
                          >
                            {label && (
                              <span className="min-w-10 text-xs font-semibold text-muted-foreground">
                                {label}
                              </span>
                            )}
                            <button
                              type="button"
                              aria-label={`Decrease ${p.name} ${label ?? ""}`}
                              className={`${btnSubtle} h-7 w-7 justify-center`}
                              disabled={isVariantSaving || displayStock <= 0}
                              onClick={() => changeDelta(v.id, -1)}
                            >
                              <Minus size={13} />
                            </button>
                            <span
                              className={`flex h-7 w-14 items-center justify-center rounded-sm border text-center text-xs tabular-nums transition-colors ${
                                delta !== 0
                                  ? "border-primary/30 bg-primary/10 font-bold text-primary"
                                  : "border-input bg-surface"
                              }`}
                            >
                              {displayStock}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase ${p.name} ${label ?? ""}`}
                              className={`${btnSubtle} h-7 w-7 justify-center`}
                              disabled={isVariantSaving}
                              onClick={() => changeDelta(v.id, 1)}
                            >
                              <Plus size={13} />
                            </button>
                            {delta !== 0 && (
                              <span
                                className={`ml-1 text-xs font-semibold tabular-nums ${
                                  delta > 0 ? "text-emerald-500" : "text-red-400"
                                }`}
                              >
                                {delta > 0 ? "+" : ""}
                                {delta}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Per-product save button */}
                      {productHasDrafts && (
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            className={btnSubtle}
                            disabled={isProductSaving}
                            onClick={() => {
                              for (const vid of productVariantIds) resetDraft(vid);
                            }}
                          >
                            <RotateCcw size={12} />
                          </button>
                          <button
                            type="button"
                            className={`${btnPrimary} text-xs! px-3.5! py-1.5!`}
                            disabled={isProductSaving}
                            onClick={() => saveVariants(productVariantIds, p.name)}
                          >
                            {isProductSaving ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Save size={13} />
                            )}
                            {isProductSaving ? "Saving…" : "Save"}
                          </button>
                        </div>
                      )}
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
                <li key={a.id} className="space-y-1 px-5 py-3.5">
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
                  <p className="text-xs text-muted-foreground">
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