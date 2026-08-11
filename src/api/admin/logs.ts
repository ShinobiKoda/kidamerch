import { supabase } from '@/lib/supabase'

export type AdminAuditLog = {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const adminLogsApi = {
  getAll: async (): Promise<AdminAuditLog[]> => {
    const res = await fetch('/api/admin/logs', {
      headers: await authHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch logs')
    return res.json()
  }
}
