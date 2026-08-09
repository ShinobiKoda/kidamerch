import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import type { InsightsData } from '@/types/admin'

export const Route = createFileRoute('/api/admin/insights/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const url = new URL(request.url)
          const days = url.searchParams.get('days') === '7' ? 7 : 30
          const data = await getInsights(days)
          return Response.json(data)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})

const CLOSED_STATUSES = new Set(['cancelled', 'refunded'])

async function getInsights(days: 7 | 30): Promise<InsightsData> {
  const [seriesRes, statusRes, topRes] = await Promise.all([
    supabaseAdmin.rpc('admin_revenue_series', { days_back: days }),
    supabaseAdmin.rpc('admin_status_mix'),
    supabaseAdmin.rpc('admin_top_products', { limit_count: 8 }),
  ])

  if (seriesRes.error) throw new Error(`Database Error: ${seriesRes.error.message}`)
  if (statusRes.error) throw new Error(`Database Error: ${statusRes.error.message}`)
  if (topRes.error) throw new Error(`Database Error: ${topRes.error.message}`)

  const series = (seriesRes.data ?? []).map((row) => ({
    date: row.day,
    label: new Date(row.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Number(row.revenue),
  }))

  const statusMix = (statusRes.data ?? []).map((row) => ({
    name: row.status,
    count: Number(row.count),
  }))

  const topProducts = (topRes.data ?? []).map((row) => ({
    name: row.product_name,
    units: Number(row.units),
    revenue: Number(row.revenue),
  }))

  return { series, topProducts, statusMix }
}

type TopProduct = InsightsData['topProducts'][number]