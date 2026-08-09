import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import type { AdjustStockInput, StockAdjustment } from '@/types/admin'

export const Route = createFileRoute('/api/admin/inventory/adjustments')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const { data, error } = await supabaseAdmin
            .from('stock_adjustments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

          if (error) throw new Error(`Database Error: ${error.message}`)

          const adjustments: StockAdjustment[] = data.map((a) => ({
            id: a.id,
            variantId: a.variant_id,
            productName: a.product_name,
            variantLabel: a.variant_label,
            delta: a.delta,
            reason: a.reason,
            createdAt: a.created_at,
          }))
          return Response.json(adjustments)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      POST: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json()) as AdjustStockInput

          if (!body?.variantId || typeof body.delta !== 'number' || !body.reason) {
            return Response.json({ message: 'variantId, delta, and reason are required' }, { status: 400 })
          }

          // Look up current stock + product/variant labels for the snapshot
          const { data: variant, error: variantError } = await supabaseAdmin
            .from('product_variants')
            .select('id, stock, size, color, design, product_id, products(name)')
            .eq('id', body.variantId)
            .single()

          if (variantError || !variant) {
            return Response.json({ message: 'Variant not found' }, { status: 404 })
          }

          const nextStock = Math.max(0, (variant.stock ?? 0) + body.delta)

          const { error: updateError } = await supabaseAdmin
            .from('product_variants')
            .update({ stock: nextStock })
            .eq('id', body.variantId)

          if (updateError) throw new Error(`Database Error: ${updateError.message}`)

          const variantLabel = variant.size || variant.color || variant.design || null
          const productName = (variant as any).products?.name ?? 'Unknown product'

          const { data: logRow, error: logError } = await supabaseAdmin
            .from('stock_adjustments')
            .insert({
              variant_id: body.variantId,
              product_name: productName,
              variant_label: variantLabel,
              delta: body.delta,
              reason: body.reason,
            })
            .select()
            .single()

          if (logError) throw new Error(`Database Error: ${logError.message}`)

          const adjustment: StockAdjustment = {
            id: logRow.id,
            variantId: logRow.variant_id,
            productName: logRow.product_name,
            variantLabel: logRow.variant_label,
            delta: logRow.delta,
            reason: logRow.reason,
            createdAt: logRow.created_at,
          }
          return Response.json(adjustment)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})