import { supabase } from '@/lib/supabase'
import type { AdminEvent } from '@/types/admin'
import type { CreateEventInput, UpdateEventInput } from '@/types/admin'

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

export const adminEventsApi = {
  getAll: async (): Promise<AdminEvent[]> =>
    fetch('/api/admin/events', { headers: await authHeaders() }).then((res) => handle<AdminEvent[]>(res)),

  getById: async (id: string): Promise<AdminEvent> =>
    fetch(`/api/admin/events/${id}`, { headers: await authHeaders() }).then((res) => handle<AdminEvent>(res)),

  create: async (input: CreateEventInput): Promise<AdminEvent> =>
    fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(input),
    }).then((res) => handle<AdminEvent>(res)),

  update: async (id: string, input: UpdateEventInput): Promise<AdminEvent> =>
    fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(input),
    }).then((res) => handle<AdminEvent>(res)),

  remove: async (id: string): Promise<{ id: string; deleted: true }> =>
    fetch(`/api/admin/events/${id}`, {
      method: 'DELETE',
      headers: await authHeaders(),
    }).then((res) => handle<{ id: string; deleted: true }>(res)),
}