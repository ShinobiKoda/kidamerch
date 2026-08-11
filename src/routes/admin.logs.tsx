import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminLogs } from "@/hooks/admin/useAdminLogs";
import {
  EmptyState,
  TableSkeleton,
} from "@/components/admin/parts";

export const Route = createFileRoute("/admin/logs")({
  component: AdminLogsPage,
});

function AdminLogsPage() {
  const { data: logs = [], isLoading } = useAdminLogs();

  return (
    <AdminShell
      title="Audit Logs"
      description="An immutable record of administrative actions across the platform."
    >
      <div className="space-y-6">
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : logs.length === 0 ? (
          <EmptyState
            title="No logs found"
            body="There are no recorded administrative actions yet."
          />
        ) : (
          <div className="overflow-hidden rounded-sm border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50 text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Admin</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Entity</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-secondary/40">
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">
                        {log.admin_email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="capitalize">{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="ml-1 text-xs opacity-70">
                            ({log.entity_id.split('-')[0]}...)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.details ? (
                          <pre className="max-w-50 truncate text-xs">
                            {JSON.stringify(log.details)}
                          </pre>
                        ) : (
                          <span className="italic opacity-50">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
