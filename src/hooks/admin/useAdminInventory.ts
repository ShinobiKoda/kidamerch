import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminInventoryApi } from '@/api/admin/inventory'
import { adminProductKeys } from '@/hooks/admin/useAdminProducts'
import type { AdjustStockInput, AdjustmentReason, StockAdjustment } from '@/types/admin'

export const adminInventoryKeys = {
  adjustments: ['admin', 'inventory', 'adjustments'] as const,
  settings: ['admin', 'settings'] as const,
}

export function useStockAdjustments() {
  return useQuery<StockAdjustment[], Error>({
    queryKey: adminInventoryKeys.adjustments,
    queryFn: adminInventoryApi.getAdjustments,
    staleTime: 1000 * 15,
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation<StockAdjustment, Error, AdjustStockInput>({
    mutationFn: adminInventoryApi.adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInventoryKeys.adjustments })
      // stock lives on product_variants, so product list must refresh too
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

export function useStoreSettings() {
  return useQuery<{ lowStockThreshold: number }, Error>({
    queryKey: adminInventoryKeys.settings,
    queryFn: adminInventoryApi.getSettings,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSetLowStockThreshold() {
  const queryClient = useQueryClient()
  return useMutation<{ lowStockThreshold: number }, Error, number>({
    mutationFn: adminInventoryApi.setLowStockThreshold,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminInventoryKeys.settings }),
  })
}

// Convenience wrapper matching the mock's "reason" (Title Case) → real
// lowercase enum, and computing an absolute-value "set to X" as a delta.
const REASON_MAP: Record<string, AdjustmentReason> = {
  Restock: 'restock',
  Damaged: 'damaged',
  Correction: 'correction',
}
export function toAdjustmentReason(label: string): AdjustmentReason {
  return REASON_MAP[label] ?? 'correction'
}