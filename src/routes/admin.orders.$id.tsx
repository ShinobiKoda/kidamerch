import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  ConfirmDialog,
  EmptyState,
  Field,
  Panel,
  PanelHead,
  StatusBadge,
  btnGhost,
  btnPrimary,
  inputCls,
} from "@/components/admin/parts";
import { formatPrice } from "@/data/products";
import {
  useAdminOrder,
  useAdvanceOrder,
  useSetOrderStatus,
  useSetTracking,
} from "@/hooks/admin/useAdminOrders";
import type { OrderStatus } from "@/types/admin";

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetail,
});

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
};

function statusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function OrderDetail() {
  const { id } = useParams({ from: "/admin/orders/$id" });
  const { data: order, isLoading } = useAdminOrder(id);
  const advanceOrder = useAdvanceOrder();
  const setOrderStatus = useSetOrderStatus();
  const setTracking = useSetTracking();

  const [tracking, setTrackingInput] = useState("");
  const [dialog, setDialog] = useState<null | "cancel" | "refund">(null);
  const [reason, setReason] = useState("");

  if (isLoading) {
    return (
      <AdminShell title="Loading order…">
        <Panel>
          <EmptyState title="Loading…" body="Fetching order details." />
        </Panel>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell title="Order not found">
        <Panel>
          <EmptyState
            title="That order no longer exists"
            body="It may have been removed."
            action={
              <Link to="/admin/orders" className={btnPrimary}>
                Back to orders
              </Link>
            }
          />
        </Panel>
      </AdminShell>
    );
  }

  const next = NEXT[order.status];

  return (
    <AdminShell
      title={`Order ${order.id.slice(0, 8)}`}
      actions={
        <>
          {next && (
            <button
              type="button"
              className={btnPrimary}
              onClick={async () => {
                await advanceOrder.mutateAsync(order);
                toast.success(`Marked ${statusLabel(next)}`);
              }}
            >
              Mark {statusLabel(next)}
            </button>
          )}
          <button type="button" className={btnGhost} onClick={() => setDialog("refund")}>
            Refund
          </button>
          <button type="button" className={btnGhost} onClick={() => setDialog("cancel")}>
            Cancel
          </button>
        </>
      }
    >
      <Link
        to="/admin/orders"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> All orders
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel>
            <PanelHead title="Items" action={<StatusBadge status={statusLabel(order.status)} />} />
            <ul className="divide-y divide-border">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 px-4 py-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-sm border border-border bg-surface-2 text-muted-foreground">
                    <Package size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium tracking-tight">{it.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.variantDetails ? `${it.variantDetails} · ` : ""}Qty {it.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatPrice(it.priceAtOrder * it.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5 border-t border-border px-4 py-4 text-sm">
              {[
                ["Subtotal", order.subtotal],
                ["Shipping", order.shippingCost],
                ["Tax", order.tax],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between text-muted-foreground">
                  <span>{label}</span>
                  <span className="tabular-nums">{formatPrice(Number(value))}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(order.total)}</span>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Timeline" />
            {order.history.length === 0 ? (
              <EmptyState title="No history yet" body="Timeline events will appear here as the order progresses." />
            ) : (
              <ol className="space-y-4 px-4 py-4">
                {order.history.map((h, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{h.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHead title="Customer" />
            <div className="space-y-3 px-4 py-4 text-sm">
              <div>
                <p className="font-medium">{order.customerName || "Guest"}</p>
                <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                {order.customerPhone && (
                  <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                )}
              </div>
              <div>
                <p className="eyebrow text-[10px] text-muted-foreground">Shipping address</p>
                <p className="mt-1 text-sm">{order.shippingAddress ?? "Not provided"}</p>
              </div>
              {order.customerEmail && (
                <Link
                  to="/admin/customers/$email"
                  params={{ email: order.customerEmail }}
                  className="inline-block text-xs font-semibold text-primary"
                >
                  View customer profile
                </Link>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Fulfilment" />
            <div className="space-y-3 px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <StatusBadge status={statusLabel(order.paymentStatus)} />
              </div>
              <Field label="Tracking number" hint={order.trackingNumber ?? "Not yet shipped"}>
                <input
                  value={tracking}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="KGX000000DE"
                  className={inputCls}
                />
              </Field>
              <button
                type="button"
                className={`${btnGhost} w-full`}
                onClick={async () => {
                  if (!tracking.trim()) return;
                  try {
                    await setTracking.mutateAsync({ id: order.id, tracking: tracking.trim() });
                    setTrackingInput("");
                    toast.success("Tracking saved");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Failed to save tracking");
                  }
                }}
              >
                <Truck size={15} /> Save tracking
              </button>
              {order.reason && (
                <p className="rounded-sm border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
                  Reason: {order.reason}
                </p>
              )}
              {order.notes && (
                <p className="rounded-sm border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
                  Notes: {order.notes}
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={dialog !== null}
        title={dialog === "refund" ? "Refund this order?" : "Cancel this order?"}
        body={
          dialog === "refund"
            ? "The order will be marked refunded and payment set to Refunded."
            : "The order will be marked cancelled and removed from fulfilment."
        }
        confirmLabel={dialog === "refund" ? "Refund order" : "Cancel order"}
        onCancel={() => {
          setDialog(null);
          setReason("");
        }}
        onConfirm={async () => {
          if (!dialog) return;
          try {
            await setOrderStatus.mutateAsync({
              id: order.id,
              status: dialog === "refund" ? "refunded" : "cancelled",
              reason: reason.trim() || undefined,
            });
            toast.success(dialog === "refund" ? "Order refunded" : "Order cancelled");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update order");
          }
          setDialog(null);
          setReason("");
        }}
      >
        <Field label="Reason" hint="Optional, saved to the timeline">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={inputCls}
            placeholder="Customer request"
          />
        </Field>
      </ConfirmDialog>
    </AdminShell>
  );
}