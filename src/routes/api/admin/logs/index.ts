import { createFileRoute } from "@tanstack/react-router";
import { requireRole, AuthError } from "@/server/utils/require-role";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const Route = createFileRoute("/api/admin/logs/")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          await requireRole(request, "admin");

          const { data: logs, error: logsError } = await supabaseAdmin
            .from("admin_audit_logs")
            .select(
              `
          *,
          admin:profiles ( id, role )
        `,
            )
            .order("created_at", { ascending: false })
            .limit(100);

          if (logsError) throw logsError;

          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
          if (authError) throw authError;

          const authMap = new Map(authData.users.map((u) => [u.id, u.email]));

          const formattedLogs = logs.map((log) => ({
            ...log,
            admin_email: log.admin_id ? authMap.get(log.admin_id) || "Unknown" : "System",
          }));

          return Response.json(formattedLogs);
        } catch (e: any) {
          if (e instanceof AuthError) return e;
          return Response.json({ message: e.message }, { status: 500 });
        }
      },
    },
  },
});
