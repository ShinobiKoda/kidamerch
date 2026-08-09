// src/hooks/admin/useAdminCustomers.ts
import { useMemo } from 'react'
import { useAdminOrders } from '@/hooks/admin/useAdminOrders'
import type { Order } from '@/types/admin'

export interface Customer {
  name: string
  email: string
  orders: Order[]
  spent: number
  last: string // ISO date of most recent order
}

export function useAdminCustomers() {
  const { data: orders = [], isLoading, isError } = useAdminOrders()

  const customers = useMemo(() => {
    const byEmail = new Map<string, Customer>()

    for (const o of orders) {
      // Orders with no resolvable email (edge case flagged earlier) can't
      // be grouped into a customer record — skip rather than create a
      // bucket keyed on an empty string that'd merge unrelated guests.
      if (!o.customerEmail) continue

      const existing = byEmail.get(o.customerEmail)
      // Only count spend from orders that were actually paid — matches
      // the intent of "total spent," not "total ever ordered."
      const countsTowardSpend = o.paymentStatus === 'paid'

      if (existing) {
        existing.orders.push(o)
        if (countsTowardSpend) existing.spent += o.total
        if (o.createdAt > existing.last) existing.last = o.createdAt
        if (o.createdAt > existing.last) existing.name = o.customerName || existing.name
      } else {
        byEmail.set(o.customerEmail, {
          name: o.customerName || o.customerEmail,
          email: o.customerEmail,
          orders: [o],
          spent: countsTowardSpend ? o.total : 0,
          last: o.createdAt,
        })
      }
    }

    return Array.from(byEmail.values())
  }, [orders])

  return { customers, isLoading, isError }
}