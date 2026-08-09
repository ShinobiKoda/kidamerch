import { supabase } from '@/lib/supabase'
import type { StoreSettings, UpdateStoreSettingsInput } from '@/types/admin'

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

export const adminSettingsApi = {
  get: async (): Promise<StoreSettings> =>
    fetch('/api/admin/settings', { headers: await authHeaders() }).then((res) =>
      handle<StoreSettings>(res),
    ),

  update: async (input: UpdateStoreSettingsInput): Promise<StoreSettings> =>
    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(input),
    }).then((res) => handle<StoreSettings>(res)),
}