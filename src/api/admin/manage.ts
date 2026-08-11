import { getRequiredEnv } from '@/lib/get-required-env'
import { supabase } from '@/lib/supabase'

export type AdminUser = {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  is_active: boolean;
  last_sign_in_at?: string;
  invited_by?: string;
  invited_by_email?: string;
  invited_at?: string;
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const adminManageApi = {
  getAll: async (): Promise<AdminUser[]> => {
    const res = await fetch('/api/admin/manage', {
      headers: await authHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch admins')
    return res.json()
  },
  
  invite: async (email: string): Promise<void> => {
    const res = await fetch('/api/admin/manage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders())
      },
      body: JSON.stringify({ email })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to invite admin')
    }
  },

  toggleActive: async (id: string, is_active: boolean): Promise<void> => {
    const res = await fetch('/api/admin/manage', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders())
      },
      body: JSON.stringify({ id, is_active })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to update admin')
    }
  },

  remove: async (id: string): Promise<void> => {
    const res = await fetch('/api/admin/manage', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders())
      },
      body: JSON.stringify({ id })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to remove admin')
    }
  }
}
