import { getRequiredEnv } from '@/lib/get-required-env'

export type AdminUser = {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  is_active: boolean;
  invited_by?: string;
  invited_at?: string;
}

export const adminManageApi = {
  getAll: async (): Promise<AdminUser[]> => {
    const token = localStorage.getItem('auth-token')
    const res = await fetch('/api/admin/manage', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch admins')
    return res.json()
  },
  
  invite: async (email: string): Promise<void> => {
    const token = localStorage.getItem('auth-token')
    const res = await fetch('/api/admin/manage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to invite admin')
    }
  }
}
