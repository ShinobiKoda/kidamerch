import { useQuery } from '@tanstack/react-query'
import { adminInsightsApi } from '@/api/admin/insights'
import type { InsightsData } from '@/types/admin'

export const adminInsightsKeys = {
  range: (days: 7 | 30) => ['admin', 'insights', days] as const,
}

export function useAdminInsights(days: 7 | 30) {
  return useQuery<InsightsData, Error>({
    queryKey: adminInsightsKeys.range(days),
    queryFn: () => adminInsightsApi.get(days),
    staleTime: 1000 * 60,
  })
}