import { supabase } from '@/lib/supabase'
import type { InsightsData } from '@/types/admin'

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.statusMessage || body?.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const adminInsightsApi = {
  get: async (days: 7 | 30): Promise<InsightsData> =>
    fetch(`/api/admin/insights?days=${days}`, { headers: await authHeaders() }).then((res) =>
      handle<InsightsData>(res),
    ),
}