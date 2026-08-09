import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLogin } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — KidaMerch" },
      {
        name: "description",
        content:
          "Operational console for the KidaMerch catalogue: products, orders, inventory, customers and events.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Console — KidaMerch" },
      {
        property: "og:description",
        content: "Manage catalogue, orders, inventory and events.",
      },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { ready, isAdmin } = useAuth();
  if (!ready) return <div className="min-h-screen bg-surface-2" />;
  if (!isAdmin) return <AdminLogin />;
  return <Outlet />;
}