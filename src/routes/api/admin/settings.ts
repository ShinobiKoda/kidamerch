import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'

export const Route = createFileRoute('/api/admin/settings')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const { data, error } = await supabaseAdmin
            .from('store_settings')
            .select('low_stock_threshold')
            .single()

          if (error) throw new Error(`Database Error: ${error.message}`)
          return Response.json({ lowStockThreshold: data.low_stock_threshold })
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      PUT: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json()) as { lowStockThreshold?: number }

          if (typeof body.lowStockThreshold !== 'number' || body.lowStockThreshold < 1) {
            return Response.json({ message: 'lowStockThreshold must be a positive number' }, { status: 400 })
          }

          const { error } = await supabaseAdmin
            .from('store_settings')
            .update({ low_stock_threshold: Math.round(body.lowStockThreshold) })
            .eq('id', true)

          if (error) throw new Error(`Database Error: ${error.message}`)
          return Response.json({ lowStockThreshold: Math.round(body.lowStockThreshold) })
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})