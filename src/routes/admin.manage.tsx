import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail, ShieldAlert, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/useAuth";
import { useAdmins, useInviteAdmin } from "@/hooks/admin/useAdminManage";
import {
  btnPrimary,
  inputCls,
  EmptyState,
  TableSkeleton,
  Panel,
} from "@/components/admin/parts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/manage")({
  component: ManageAdminsPage,
});

function ManageAdminsPage() {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  
  if (!isSuperAdmin) {
    // If not superadmin, redirect to admin home
    navigate({ to: "/admin" });
    return null;
  }

  const { data: admins = [], isLoading } = useAdmins();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <AdminShell
      title="Manage Admins"
      description="View and invite administrators to manage KidaMerch."
      actions={
        <button
          onClick={() => setInviteModalOpen(true)}
          className={`${btnPrimary} h-9 px-4 text-sm`}
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Invite Admin</span>
        </button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : admins.length === 0 ? (
          <EmptyState
            title="No admins found"
            body="Invite an administrator to get started."
            action={
              <button
                onClick={() => setInviteModalOpen(true)}
                className={`${btnPrimary} h-9 px-4 text-sm`}
              >
                Invite Admin
              </button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-sm border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50 text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-4 py-3 text-foreground">{admin.email}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">
                        {admin.role === 'superadmin' ? (
                          <span className="inline-flex items-center gap-1.5 text-primary">
                            <ShieldAlert size={14} /> Superadmin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck size={14} /> Admin
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {admin.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-green-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                            Inactive
                          </span>
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

      <InviteAdminModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </AdminShell>
  );
}

function InviteAdminModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const inviteMutation = useInviteAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await inviteMutation.mutateAsync(email);
      toast.success("Invitation sent successfully");
      onOpenChange(false);
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Admin</DialogTitle>
          <DialogDescription>
            Send an email invitation to give a new user administrative access to KidaMerch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="eyebrow text-[10px] text-muted-foreground">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className={`${inputCls} mt-1.5`}
            />
          </label>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 flex-1 rounded-sm border border-border bg-transparent text-sm font-medium transition-colors hover:bg-secondary/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteMutation.isPending || !email}
              className={`${btnPrimary} h-10 flex-1 px-4 text-sm`}
            >
              {inviteMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Mail size={16} /> Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
