import { Minus, Plus } from "lucide-react";

export function QtyStepper({
  qty,
  onChange,
  compact = false,
}: {
  qty: number;
  onChange: (next: number) => void;
  compact?: boolean;
}) {
  const size = compact ? "h-9 w-9" : "h-11 w-11";
  return (
    <div className="inline-flex items-center rounded-sm border border-border">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(qty - 1)}
        className={`${size} grid place-items-center text-muted-foreground transition-colors duration-150 hover:text-foreground`}
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(qty + 1)}
        className={`${size} grid place-items-center text-muted-foreground transition-colors duration-150 hover:text-foreground`}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
