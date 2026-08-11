import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const Route = createFileRoute('/api/checkout/')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const { lines, subtotal, shipping, tax, total } = body

          if (!lines || !Array.isArray(lines) || lines.length === 0) {
            return Response.json({ error: 'Cart is empty' }, { status: 400 })
          }

          const authHeader = request.headers.get('Authorization')
          let userId: string | null = null
          
          if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const { data: userData } = await supabaseAdmin.auth.getUser(token)
            if (userData?.user) {
              userId = userData.user.id
            }
          }

          const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
              user_id: userId,
              guest_name: 'WhatsApp Guest',
              status: 'pending',
              payment_status: 'pending',
              subtotal,
              shipping_cost: shipping,
              tax,
              total_estimate: total,
              whatsapp_sent_at: new Date().toISOString(),
            })
            .select('id')
            .single()

          if (orderError) throw orderError

          const orderItems = lines.map((item: any) => {
            const v = item.line.variant
            let vDetails = 'Standard'
            if (v) {
              const parts = []
              if (v.size) parts.push(v.size)
              if (v.color) parts.push(v.color)
              if (v.design) parts.push(v.design)
              if (parts.length > 0) vDetails = parts.join(' / ')
            }

            return {
              order_id: order.id,
              variant_id: item.line.variant?.id ?? item.product.variants?.[0]?.id,
              product_name: item.product.name,
              quantity: item.line.qty,
              price_at_order: item.product.basePrice,
              variant_details: vDetails,
            }
          })

          const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(orderItems)

          if (itemsError) throw itemsError

          return Response.json({ success: true, orderId: order.id })
        } catch (err: any) {
          console.error('Checkout API Error:', err)
          return Response.json({ error: 'Failed to process order' }, { status: 500 })
        }
      },
    },
  },
})
