import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import { transformEvent } from '@/lib/helpers'
import type { AdminEvent, CreateEventInput } from '@/types/admin'

export const Route = createFileRoute('/api/admin/events/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const events = await getEvents()
          return Response.json(events)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      POST: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json()) as CreateEventInput
          const event = await createEvent(body)
          return Response.json(event)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})

async function getEvents(): Promise<AdminEvent[]> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw new Error(`Database Error: ${error.message}`)
  return data.map(transformEvent)
}

async function createEvent(body: CreateEventInput): Promise<AdminEvent> {
  if (!body?.name || !body.date || !body.location) {
    throw new Error('name, date, and location are required')
  }

  if (body.featured) {
    const { count, error: countError } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true)

    if (countError) throw new Error(`Database Error: ${countError.message}`)
    if ((count ?? 0) >= 3) throw new Error('Only three events can be featured at once')
  }

  const { data, error } = await supabaseAdmin
    .from('events')
    .insert({
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
    .select()
    .single()

  if (error) throw new Error(`Database Error: ${error.message}`)
  return transformEvent(data)
}