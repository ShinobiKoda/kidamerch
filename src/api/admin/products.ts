import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/storefront'
import type { CreateProductInput, UpdateProductInput } from '@/types/admin'

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

export const adminProductsApi = {
  getAll: async (): Promise<Product[]> =>
    fetch('/api/admin/products', { headers: await authHeaders() }).then((res) => handle<Product[]>(res)),

  getById: async (id: string): Promise<Product> =>
    fetch(`/api/admin/products/${id}`, { headers: await authHeaders() }).then((res) => handle<Product>(res)),

  create: async (input: CreateProductInput): Promise<Product> =>
    fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(input),
    }).then((res) => handle<Product>(res)),

  update: async (id: string, input: UpdateProductInput): Promise<Product> =>
    fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(input),
    }).then((res) => handle<Product>(res)),

  remove: async (id: string): Promise<{ id: string; deleted: true }> =>
    fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: await authHeaders(),
    }).then((res) => handle<{ id: string; deleted: true }>(res)),
}