// src/routes/api/admin/orders/index.ts
import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import { transformOrder } from '@/lib/helpers'
import type { Order } from '@/types/admin'

export const Route = createFileRoute('/api/admin/orders/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireRole(request, 'admin')

          const { data: orders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

          if (ordersError) throw new Error(`Database Error: ${ordersError.message}`)
          if (!orders?.length) return Response.json([])

          const orderIds = orders.map((o) => o.id)

          const { data: allItems, error: itemsError } = await supabaseAdmin
            .from('order_items')
            .select('*')
            .in('order_id', orderIds)

          if (itemsError) throw new Error(`Database Error: ${itemsError.message}`)

          const { data: allHistory, error: historyError } = await supabaseAdmin
            .from('order_history')
            .select('*')
            .in('order_id', orderIds)

          if (historyError) throw new Error(`Database Error: ${historyError.message}`)

          // Resolve customer identity for user-linked (non-guest) orders in one batch
          const userIds = Array.from(
            new Set(orders.filter((o) => o.user_id && !o.guest_email).map((o) => o.user_id)),
          )
          const emailByUserId = new Map<string, string>()
          for (const uid of userIds) {
            const { data } = await supabaseAdmin.auth.admin.getUserById(uid)
            if (data?.user?.email) emailByUserId.set(uid, data.user.email)
          }

          const result: Order[] = orders.map((o) => {
            const items = allItems?.filter((it) => it.order_id === o.id) ?? []
            const history = allHistory?.filter((h) => h.order_id === o.id) ?? []
            const email = emailByUserId.get(o.user_id) ?? ''
            return transformOrder(o, items, history, email, email || 'Guest')
          })

          return Response.json(result)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})