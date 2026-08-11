import { supabaseAdmin } from '@/lib/supabase-admin'

type AdminActionArgs = {
  adminId: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, any>
}

export async function logAdminAction({
  adminId,
  action,
  entityType,
  entityId,
  details
}: AdminActionArgs): Promise<void> {
  const { error } = await supabaseAdmin
    .from('admin_audit_logs')
    .insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || null
    })

  if (error) {
    console.error('Failed to log admin action:', error)
  }
}
