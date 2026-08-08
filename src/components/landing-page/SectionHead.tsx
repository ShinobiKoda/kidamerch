import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export default function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 pb-8">
      <div className="min-w-0">
        <p className="eyebrow text-primary">{eyebrow}</p>
        <h2 className="display-xl mt-3 text-4xl sm:text-5xl">{title}</h2>
      </div>
      {action && (
        <Link
          to={action.to as never}
          className="eyebrow inline-flex shrink-0 items-center gap-1.5 pb-2 text-[10px] text-muted-foreground transition-colors duration-150 hover:text-primary"
        >
          {action.label} <ArrowUpRight size={13} />
        </Link>
      )}
    </div>
  );
}
