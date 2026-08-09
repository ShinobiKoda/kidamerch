import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import { transformEvent } from '@/lib/helpers'
import type { AdminEvent, UpdateEventInput } from '@/types/admin'

export const Route = createFileRoute('/api/admin/events/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireRole(request, 'admin')
          const event = await getEvent(params.id)
          return Response.json(event)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      PUT: async ({ request, params }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json()) as UpdateEventInput
          const event = await updateEvent(params.id, body)
          return Response.json(event)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          await requireRole(request, 'admin')
          const { error } = await supabaseAdmin.from('events').delete().eq('id', params.id)
          if (error) throw new Error(`Database Error: ${error.message}`)
          return Response.json({ id: params.id, deleted: true })
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})

async function getEvent(id: string): Promise<AdminEvent> {
  const { data, error } = await supabaseAdmin.from('events').select('*').eq('id', id).single()
  if (error) throw new Error(`Event not found: ${error.message}`)
  return transformEvent(data)
}

async function updateEvent(id: string, body: UpdateEventInput): Promise<AdminEvent> {
  if (!body?.name || !body.date || !body.location) {
    throw new Error('name, date, and location are required')
  }

  if (body.featured) {
    const { count, error: countError } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true)
      .neq('id', id)

    if (countError) throw new Error(`Database Error: ${countError.message}`)
    if ((count ?? 0) >= 3) throw new Error('Only three events can be featured at once')
  }

  const { error } = await supabaseAdmin
    .from('events')
    .update({
      name: body.name,
      kind: body.kind,
      date: body.date,
      location: body.location,
      description: body.description ?? null,
      cover: body.cover ?? null,
      gallery: body.gallery ?? [],
      status: body.status,
      featured: body.featured ?? false,
    })
    .eq('id', id)

  if (error) throw new Error(`Database Error: ${error.message}`)
  return getEvent(id)
}