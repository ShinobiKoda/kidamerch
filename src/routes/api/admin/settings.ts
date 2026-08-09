import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import { transformStoreSettings } from '@/lib/helpers'
import type { StoreSettings, UpdateStoreSettingsInput } from '@/types/admin'

export const Route = createFileRoute('/api/admin/settings')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const settings = await getSettings()
          return Response.json(settings)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      PUT: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json()) as UpdateStoreSettingsInput
          const settings = await updateSettings(body)
          return Response.json(settings)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})

async function getSettings(): Promise<StoreSettings> {
  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .select('*')
    .eq('id', true)
    .single()

  if (error) throw new Error(`Database Error: ${error.message}`)
  return transformStoreSettings(data)
}

async function updateSettings(body: UpdateStoreSettingsInput): Promise<StoreSettings> {
  if (body.lowStockThreshold == null || body.lowStockThreshold < 0) {
    throw new Error('lowStockThreshold must be a non-negative number')
  }

  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .update({ low_stock_threshold: body.lowStockThreshold })
    .eq('id', true)
    .select()
    .single()

  if (error) throw new Error(`Database Error: ${error.message}`)
  return transformStoreSettings(data)
}