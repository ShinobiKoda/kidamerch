// src/api/admin/orders.ts
import { supabase } from '@/lib/supabase'
import type { Order, UpdateOrderInput } from '@/types/admin'

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

export const adminOrdersApi = {
  getAll: async (): Promise<Order[]> =>
    fetch('/api/admin/orders', { headers: await authHeaders() }).then((res) => handle<Order[]>(res)),

  getById: async (id: string): Promise<Order> =>
    fetch(`/api/admin/orders/${id}`, { headers: await authHeaders() }).then((res) => handle<Order>(res)),

  update: async (id: string, input: UpdateOrderInput): Promise<Order> =>
    fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(input),
    }).then((res) => handle<Order>(res)),
}