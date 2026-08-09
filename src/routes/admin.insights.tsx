import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { EmptyState, Panel, PanelHead } from "@/components/admin/parts";
import { formatPrice } from "@/data/products";
import { useAdminInsights } from "@/hooks/admin/useAdminInsights";

export const Route = createFileRoute("/admin/insights")({
  component: InsightsPage,
});

const axis = { fontSize: 11, fill: "var(--color-muted-foreground)" };
const tooltipStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 4,
  fontSize: 12,
};

function InsightsPage() {
  const [range, setRange] = useState<7 | 30>(30);
  const { data, isLoading, isError, error } = useAdminInsights(range);

  const series = data?.series ?? [];
  const topProducts = data?.topProducts ?? [];
  const statusMix = data?.statusMix ?? [];

  return (
    <AdminShell
      title="Insights"
      description="Sales trend, best sellers and fulfilment mix across the catalogue."
      actions={
        <div className="flex rounded-sm border border-border p-0.5">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`h-8 rounded-[2px] px-3 text-xs font-semibold ${
                range === r ? "bg-secondary" : "text-muted-foreground"
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      }
    >
      {isError ? (
        <Panel>
          <EmptyState
            title="Couldn't load insights"
            body={error instanceof Error ? error.message : "Something went wrong."}
          />
        </Panel>
      ) : (
        <>
          <Panel>
            <PanelHead title="Revenue trend" />
            <div className="h-72 px-2 py-4">
              {isLoading ? (
                <div className="h-full w-full animate-pulse rounded-sm bg-secondary/50" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={axis} tickLine={false} axisLine={false} width={52} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatPrice(v)} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel>
              <PanelHead title="Best sellers" />
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded-sm bg-secondary/50" />
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <EmptyState title="No sales yet" body="Once orders come in, best sellers will show up here." />
              ) : (
                <ul className="divide-y divide-border">
                  {topProducts.map((p) => (
                    <li key={p.name} className="flex items-center gap-3 px-4 py-3">
                      <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{p.units} units</span>
                      <span className="w-24 text-right text-sm font-semibold tabular-nums">
                        {formatPrice(p.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel>
              <PanelHead title="Order status mix" />
              <div className="h-72 px-2 py-4">
                {isLoading ? (
                  <div className="h-full w-full animate-pulse rounded-sm bg-secondary/50" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusMix}>
                      <CartesianGrid stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                      <YAxis tick={axis} tickLine={false} axisLine={false} width={32} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Panel>
          </div>
        </>
      )}
    </AdminShell>
  );
}