// src/api/admin/inventory.ts
import { supabase } from '@/lib/supabase'
import type { AdjustStockInput, StockAdjustment } from '@/types/admin'

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const adminInventoryApi = {
  getAdjustments: async (): Promise<StockAdjustment[]> =>
    fetch('/api/admin/inventory/adjustments', { headers: await authHeaders() }).then((res) =>
      handle<StockAdjustment[]>(res),
    ),

  adjustStock: async (input: AdjustStockInput): Promise<StockAdjustment> =>
    fetch('/api/admin/inventory/adjustments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(input),
    }).then((res) => handle<StockAdjustment>(res)),

  getSettings: async (): Promise<{ lowStockThreshold: number }> =>
    fetch('/api/admin/settings', { headers: await authHeaders() }).then((res) =>
      handle<{ lowStockThreshold: number }>(res),
    ),

  setLowStockThreshold: async (lowStockThreshold: number): Promise<{ lowStockThreshold: number }> =>
    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ lowStockThreshold }),
    }).then((res) => handle<{ lowStockThreshold: number }>(res)),
}