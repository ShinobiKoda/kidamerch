import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Boxes, CalendarDays, ChartNoAxesCombined, ExternalLink,
  LayoutDashboard, LogOut, Menu, Package, ReceiptText, Tags, Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme";
import { EASE } from "@/components/Reveal";
import { useData } from "@/lib/data-store";
import { useAuth } from "@/hooks/useAuth";
import { btnGhost } from "@/components/admin/parts";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ReceiptText },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/insights", label: "Insights", icon: ChartNoAxesCombined },
] as { to: string; label: string; icon: typeof Package; exact?: boolean }[];

export function AdminShell({ title, description, actions, children }: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { orders, products, lowStockThreshold } = useData();
  const { logout } = useAuth();
  const [mobileNav, setMobileNav] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const pending = orders.filter((o) => o.status === "Pending").length;
  const low = products.filter((p) => p.stock > 0 && p.stock <= lowStockThreshold).length;
  const counts: Record<string, number> = {
    "/admin/orders": pending,
    "/admin/inventory": low,
  };

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <Link to="/admin" className="mb-4 flex items-center gap-2 px-2 py-2" onClick={() => setMobileNav(false)}>
        <span className="grid h-8 w-8 place-items-center rounded-sm bg-primary text-[13px] font-black text-primary-foreground">K</span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">KidaMerch</span>
          <span className="eyebrow block text-[9px] text-muted-foreground">Operations</span>
        </span>
      </Link>

      {nav.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        const count = counts[item.to] ?? 0;
        return (
          <Link
            key={item.to}
            to={item.to as "/admin"}
            onClick={() => setMobileNav(false)}
            className={`group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="admin-active"
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-primary"
              />
            )}
            <item.icon size={16} />
            <span className="flex-1">{item.label}</span>
            {count > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary tabular-nums">
                {count}
              </span>
            )}
          </Link>
        );
      })}

      <div className="mt-auto space-y-1 border-t border-border pt-3">
        <Link to="/" className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
          <ExternalLink size={16} />
          View storefront
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-surface-2">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-surface lg:block">
        {sidebar}
      </aside>

      {mobileNav && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <motion.div className="absolute inset-0 bg-ink/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setMobileNav(false)} />
          <motion.div className="relative h-full w-64 border-r border-border bg-surface" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3, ease: EASE }}>
            {sidebar}
          </motion.div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3.5 md:px-6">
            <button type="button" aria-label="Open menu" onClick={() => setMobileNav(true)} className="grid h-9 w-9 place-items-center rounded-sm border border-border lg:hidden">
              <Menu size={16} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-[9px] text-muted-foreground">Admin</p>
              <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="hidden items-center gap-2 sm:flex">{actions}</div>
            <ThemeToggle />
          </div>
          {actions && <div className="flex items-center gap-2 px-4 pb-3 sm:hidden">{actions}</div>}
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-8">
          {description && <p className="mb-6 max-w-2xl text-sm text-muted-foreground">{description}</p>}
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="grid min-h-screen place-items-center bg-surface-2 px-4">
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setLoading(true);
          try {
            await login(email, password);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid credentials");
          } finally {
            setLoading(false);
          }
        }}
        className="w-full max-w-sm rounded-md border border-border bg-surface p-7 shadow-lift"
      >
        <span className="grid h-9 w-9 place-items-center rounded-sm bg-primary text-sm font-black text-primary-foreground">K</span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in with your admin account.</p>

        <label className="mt-6 block">
          <span className="eyebrow text-[10px] text-muted-foreground">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="username"
            className="mt-1.5 h-11 w-full rounded-sm border border-input bg-surface-2 px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="mt-4 block">
          <span className="eyebrow text-[10px] text-muted-foreground">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            className="mt-1.5 h-11 w-full rounded-sm border border-input bg-surface-2 px-3 text-sm outline-none focus:border-primary"
          />
        </label>

        {error && <p className="mt-3 text-xs text-primary">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 h-11 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <Link to="/" className={`${btnGhost} mt-3 w-full`}>
          Back to storefront
        </Link>
      </motion.form>
    </div>
  );
}