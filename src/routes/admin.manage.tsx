import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail, ShieldAlert, ShieldCheck, UserPlus, Trash2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/useAuth";
import { useAdmins, useInviteAdmin, useToggleAdmin, useRemoveAdmin } from "@/hooks/admin/useAdminManage";
import type { AdminUser } from "@/api/admin/manage";
import {
  btnPrimary,
  inputCls,
  EmptyState,
  TableSkeleton,
  Panel,
} from "@/components/admin/parts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/manage")({
  component: ManageAdminsPage,
});

function ManageAdminsPage() {
  const { isSuperAdmin, session } = useAuth();
  const navigate = useNavigate();
  
  if (!isSuperAdmin) {
    // If not superadmin, redirect to admin home
    navigate({ to: "/admin" });
    return null;
  }

  const { data: admins = [], isLoading } = useAdmins();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<AdminUser | null>(null);
  
  const toggleMutation = useToggleAdmin();
  const removeMutation = useRemoveAdmin();
  const inviteMutation = useInviteAdmin();

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, is_active: !current });
      toast.success(current ? "Admin access revoked" : "Admin access restored");
    } catch (err: any) {
      toast.error(err.message || "Failed to update admin");
    }
  };

  const handleResend = async (email: string) => {
    try {
      await inviteMutation.mutateAsync(email);
      toast.success("Invite email resent successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend invite");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id);
      toast.success("Admin successfully removed");
      setAdminToRemove(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove admin");
    }
  };

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
                    <th className="px-4 py-3 font-medium">Invited By</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
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
                      <td className="px-4 py-3 text-muted-foreground">
                        {admin.invited_by_email || 'System'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={admin.is_active} 
                            onCheckedChange={() => handleToggle(admin.id, admin.is_active)}
                            disabled={toggleMutation.isPending || admin.id === session?.user.id}
                          />
                          {!admin.is_active ? (
                            <span className="text-muted-foreground">Inactive</span>
                          ) : admin.last_sign_in_at ? (
                            <span className="text-green-500">Active</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-orange-500">Pending</span>
                              <button
                                onClick={() => handleResend(admin.email)}
                                disabled={inviteMutation.isPending}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                                title="Resend Invite Email"
                              >
                                {inviteMutation.isPending ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Send size={12} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setAdminToRemove(admin)}
                          disabled={admin.id === session?.user.id}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                          title="Remove Admin"
                        >
                          <Trash2 size={16} />
                        </button>
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

      <Dialog open={!!adminToRemove} onOpenChange={(open) => !open && setAdminToRemove(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{adminToRemove?.email}</strong>? They will lose all access to the admin panel, but their historical actions will remain in the logs.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setAdminToRemove(null)}
              className="h-10 flex-1 rounded-sm border border-border bg-transparent text-sm font-medium transition-colors hover:bg-secondary/60"
            >
              Cancel
            </button>
            <button
              onClick={() => adminToRemove && handleRemove(adminToRemove.id)}
              disabled={removeMutation.isPending}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm bg-red-500 px-4 text-sm font-semibold text-white transition-opacity hover:bg-red-600 disabled:opacity-50"
            >
              {removeMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Remove Admin"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
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
