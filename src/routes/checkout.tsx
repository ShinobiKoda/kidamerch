import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import { useStore } from "@/lib/store";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { EASE } from "@/components/Reveal";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — KidaMerch" },
      {
        name: "description",
        content:
          "Mock checkout flow: shipping details, card entry and confirmation. This is a prototype — no payment is processed.",
      },
      { property: "og:title", content: "Checkout — KidaMerch" },
      { property: "og:description", content: "Mock checkout — no payment is processed." },
    ],
  }),
  component: Checkout,
});

const STEPS = ["Shipping", "Payment", "Confirmation"] as const;

function Checkout() {
  const { lines, subtotal, shipping, tax, total, clearCart } = useStore();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [orderNumber] = useState(
    () => `KRG-${Math.floor(100000 + Math.random() * 899999)}`,
  );
  const [snapshot, setSnapshot] = useState<{ count: number; total: number } | null>(null);

  const empty = lines.length === 0 && step < 2;

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
      <header className="pb-8">
        <p className="eyebrow text-primary">Secure · Prototype</p>
        <h1 className="display-xl mt-3 text-5xl sm:text-6xl">Checkout</h1>
      </header>

      <StepIndicator step={step} />

      {empty ? (
        <div className="mt-14 rounded-sm border border-dashed border-border py-20 text-center">
          <h2 className="display-xl text-2xl">Nothing to check out</h2>
          <p className="mt-3 text-sm text-muted-foreground">Add a piece to the bag first.</p>
          <Link
            to="/shop"
            className="eyebrow mt-8 inline-flex h-14 items-center rounded-sm bg-primary px-7 text-primary-foreground"
          >
            Shop the drop
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {step === 0 && <ShippingStep onNext={() => setStep(1)} />}
                {step === 1 && (
                  <PaymentStep
                    processing={processing}
                    onBack={() => setStep(0)}
                    onPay={() => {
                      setProcessing(true);
                      setSnapshot({
                        count: lines.reduce((n, l) => n + l.line.qty, 0),
                        total,
                      });
                      setTimeout(() => {
                        setProcessing(false);
                        setStep(2);
                        clearCart();
                      }, 1600);
                    }}
                  />
                )}
                {step === 2 && <ConfirmationStep orderNumber={orderNumber} snapshot={snapshot} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {step < 2 && (
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
          )}
        </div>
      )}
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const address = String(data.get("address") ?? "").trim();
    if (name.length < 2) next['name'] = "Enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) next['email'] = "Enter a valid email.";
    if (address.length < 6) next['address'] = "Enter a street address.";
    setErrors(next);
    if (Object.keys(next).length === 0) onNext();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <h2 className="display-xl text-2xl">Shipping details</h2>
      <Field label="Full name" error={errors['name']}>
        <input name="name" className={fieldClass} placeholder="Rei Tanaka" />
      </Field>
      <Field label="Email" error={errors['email']}>
        <input name="email" type="email" className={fieldClass} placeholder="you@email.com" />
      </Field>
      <Field label="Street address" error={errors['address']}>
        <input name="address" className={fieldClass} placeholder="12 Warehouse Lane" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="City">
          <input name="city" className={fieldClass} placeholder="Berlin" />
        </Field>
        <Field label="Postal code">
          <input name="zip" className={fieldClass} placeholder="10119" />
        </Field>
      </div>
      <button
        type="submit"
        className="eyebrow h-14 w-full rounded-sm bg-primary text-primary-foreground transition-opacity duration-200 hover:opacity-90 sm:w-auto sm:px-10"
      >
        Continue to payment
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-[10px] text-muted-foreground">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-2 block text-xs text-primary">{error}</span>}
    </label>
  );
}

function PaymentStep({
  processing,
  onPay,
  onBack,
}: {
  processing: boolean;
  onPay: () => void;
  onBack: () => void;
}) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();

  const masked = useMemo(() => (number || "").padEnd(19, "•"), [number]);

  const formatNumber = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const valid = number.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvc.length >= 3;

  return (
    <div className="space-y-6">
      <h2 className="display-xl text-2xl">Payment</h2>

      <div className="perspective-distant">
        <motion.div
          className="relative aspect-16/10 w-full max-w-sm transform-3d"
          animate={{ rotateY: flipped && !reduce ? 180 : 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="absolute inset-0 flex flex-col justify-between rounded-lg border border-border bg-surface-2 p-6 backface-hidden">
            <div className="flex items-center justify-between">
              <span className="h-7 w-10 rounded-sm bg-primary/80" />
              <span className="eyebrow text-[10px] text-muted-foreground">KidaMerch</span>
            </div>
            <p className="font-mono text-lg tracking-[0.14em]">{masked}</p>
            <div className="flex items-end justify-between text-xs">
              <span className="truncate uppercase tracking-widest">{name || "Card holder"}</span>
              <span className="tabular-nums">{expiry || "MM/YY"}</span>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-center gap-4 rounded-lg border border-border bg-surface-2 p-6 backface-hidden transform-[rotateY(180deg)]">
            <span className="-mx-6 h-10 bg-ink" />
            <span className="ml-auto rounded-sm bg-background px-4 py-2 font-mono text-sm">
              {cvc || "•••"}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="space-y-5">
        <Field label="Card number">
          <input
            inputMode="numeric"
            value={number}
            onFocus={() => setFlipped(false)}
            onChange={(e) => setNumber(formatNumber(e.target.value))}
            placeholder="4242 4242 4242 4242"
            className={fieldClass}
          />
        </Field>
        <Field label="Name on card">
          <input
            value={name}
            onFocus={() => setFlipped(false)}
            onChange={(e) => setName(e.target.value)}
            placeholder="R. TANAKA"
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Expiry">
            <input
              inputMode="numeric"
              value={expiry}
              onFocus={() => setFlipped(false)}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="09/29"
              className={fieldClass}
            />
          </Field>
          <Field label="CVC">
            <input
              inputMode="numeric"
              value={cvc}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              className={fieldClass}
            />
          </Field>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        No payment processor is connected. Submitting simulates a charge.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="eyebrow h-14 rounded-sm border border-border px-7 transition-colors duration-200 hover:bg-secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onPay}
          disabled={!valid || processing}
          className="eyebrow inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-7 text-primary-foreground transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground sm:flex-none"
        >
          {processing ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Processing
            </>
          ) : (
            "Pay now"
          )}
        </button>
      </div>
    </div>
  );
}

function ConfirmationStep({
  orderNumber,
  snapshot,
}: {
  orderNumber: string;
  snapshot: { count: number; total: number } | null;
}) {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBurst(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="text-center lg:text-left">
      <div className="relative mx-auto h-24 w-24 lg:mx-0">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--border)" strokeWidth="3" />
          <motion.path
            d="M28 52 L44 68 L73 36"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0.2 : 0.7, ease: EASE }}
          />
        </svg>
        {!reduce &&
          burst &&
          Array.from({ length: 10 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-primary"
              initial={{ opacity: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                x: Math.cos((i / 10) * Math.PI * 2) * 70,
                y: Math.sin((i / 10) * Math.PI * 2) * 70,
              }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          ))}
      </div>

      <h2 className="display-xl mt-8 text-4xl">Order placed</h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Thanks — your pieces are reserved. A mock confirmation would land in your inbox within a
        few minutes.
      </p>

      <dl className="mt-10 grid max-w-md gap-6 rule-line pt-6 text-left sm:grid-cols-3">
        <div>
          <dt className="eyebrow text-[10px] text-muted-foreground">Order</dt>
          <dd className="mt-1 font-semibold tabular-nums">{orderNumber}</dd>
        </div>
        <div>
          <dt className="eyebrow text-[10px] text-muted-foreground">Items</dt>
          <dd className="mt-1 font-semibold tabular-nums">{snapshot?.count ?? 0}</dd>
        </div>
        <div>
          <dt className="eyebrow text-[10px] text-muted-foreground">Paid</dt>
          <dd className="mt-1 font-semibold tabular-nums text-primary">
            {formatPrice(snapshot?.total ?? 0)}
          </dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
        <Link
          to="/shop"
          className="eyebrow inline-flex h-14 items-center rounded-sm bg-primary px-7 text-primary-foreground"
        >
          Keep shopping
        </Link>
        <Link
          to="/events"
          className="eyebrow inline-flex h-14 items-center rounded-sm border border-border px-7"
        >
          See events
        </Link>
      </div>
    </div>
  );
}
