// src/api/admin/categories.ts
import { supabase } from '@/lib/supabase'
import type { Category, CreateCategoryInput } from '@/types/admin'

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

export const adminCategoriesApi = {
  getAll: async (): Promise<Category[]> =>
    fetch('/api/admin/categories', { headers: await authHeaders() }).then((res) => handle<Category[]>(res)),

  create: async (input: CreateCategoryInput): Promise<Category> =>
    fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(input),
    }).then((res) => handle<Category>(res)),

  rename: async (id: string, name: string): Promise<Category> =>
    fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ name }),
    }).then((res) => handle<Category>(res)),

  remove: async (id: string, reassignTo?: string): Promise<{ id: string; deleted: true }> =>
    fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(reassignTo ? { reassignTo } : {}),
    }).then((res) => handle<{ id: string; deleted: true }>(res)),
}