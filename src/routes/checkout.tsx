import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import { useStore } from "@/lib/store";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { EASE } from "@/components/Reveal";
import { buildWhatsAppOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — KidaMerch" },
      {
        name: "description",
        content: "Checkout is coming soon. Orders are currently handled directly over WhatsApp.",
      },
      { property: "og:title", content: "Checkout — KidaMerch" },
      { property: "og:description", content: "Coming soon — orders are handled via WhatsApp for now." },
    ],
  }),
  component: Checkout,
});

const STEPS = ["Shipping", "Payment", "Confirmation"] as const;

function Checkout() {
  const { lines, subtotal, shipping, tax, total } = useStore();
  const [step] = useState(0);

  const whatsappHref = buildWhatsAppLink(buildWhatsAppOrderMessage(lines, total));

  return (
    <div className="relative mx-auto max-w-4xl px-5 pt-10 sm:px-8">
      {/* Non-interactive, blurred mock flow underneath */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none blur-[3px] opacity-60"
      >
        <header className="pb-8">
          <p className="eyebrow text-primary">Secure · Prototype</p>
          <h1 className="display-xl mt-3 text-5xl sm:text-6xl">Checkout</h1>
        </header>

        <StepIndicator step={step} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div>
            <ShippingStep onNext={() => {}} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-sm border border-border bg-surface p-6">
              <p className="eyebrow text-[10px] text-muted-foreground">Order summary</p>
              <ul className="mt-5 space-y-3 text-sm">
                {lines.map(({ line, product }) => (
                  <li
                    key={`${line.id}-${line.variant?.id ?? "one"}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{product.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {line.variant ? `${line.variant.size || line.variant.color || line.variant.design || "Standard"} · ` : ""}Qty {line.qty}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatPrice((product.basePrice || 0) * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
                <SummaryRow label="Subtotal" value={subtotal} />
                <SummaryRow label="Shipping" value={shipping} free />
                <SummaryRow label="Tax" value={tax} />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                <span className="eyebrow">Total</span>
                <AnimatedNumber
                  value={total}
                  format={formatPrice}
                  className="text-lg font-semibold tabular-nums text-primary"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Coming soon overlay */}
      <div className="absolute inset-0 z-10 flex items-start justify-center pt-24 sm:pt-32">
        <div className="mx-4 max-w-sm rounded-sm border border-border bg-background/95 p-8 text-center shadow-lift backdrop-blur-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-border">
            <MessageCircle size={22} className="text-primary" />
          </span>
          <h2 className="display-xl mt-6 text-2xl">Checkout coming soon</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            For now, orders are handled directly — send us your bag on WhatsApp and we'll confirm
            availability, pricing and shipping with you personally.
          </p>
          {lines.length > 0 ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 text-primary-foreground transition-opacity duration-200 hover:opacity-90"
            >
              <MessageCircle size={16} /> Continue on WhatsApp
            </a>
          ) : (
            <Link
              to="/shop"
              className="eyebrow mt-7 inline-flex h-14 w-full items-center justify-center rounded-sm bg-primary px-6 text-primary-foreground transition-opacity duration-200 hover:opacity-90"
            >
              Shop the drop
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  free,
}: {
  label: string;
  value: number;
  free?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{free && value === 0 ? "Free" : formatPrice(value)}</span>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="rule-line pt-6">
      <div className="flex items-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 flex-1">
              <p
                className={`eyebrow truncate text-[10px] ${
                  i <= step ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="text-primary">{String(i + 1).padStart(2, "0")}</span> {label}
              </p>
              <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const fieldClass =
  "h-14 w-full rounded-sm border border-input bg-background px-4 text-sm outline-none transition-colors duration-200 focus:border-primary";

function ShippingStep({ onNext }: { onNext: () => void }) {
  return (
    <form className="space-y-5">
      <h2 className="display-xl text-2xl">Shipping details</h2>
      <Field label="Full name">
        <input name="name" className={fieldClass} placeholder="Rei Tanaka" disabled />
      </Field>
      <Field label="Email">
        <input name="email" type="email" className={fieldClass} placeholder="you@email.com" disabled />
      </Field>
      <Field label="Street address">
        <input name="address" className={fieldClass} placeholder="12 Warehouse Lane" disabled />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="City">
          <input name="city" className={fieldClass} placeholder="Berlin" disabled />
        </Field>
        <Field label="Postal code">
          <input name="zip" className={fieldClass} placeholder="10119" disabled />
        </Field>
      </div>
      <button
        type="button"
        disabled
        className="eyebrow h-14 w-full rounded-sm bg-primary text-primary-foreground sm:w-auto sm:px-10"
      >
        Continue to payment
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-[10px] text-muted-foreground">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}