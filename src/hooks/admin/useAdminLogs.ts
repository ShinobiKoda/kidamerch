import { useQuery } from '@tanstack/react-query'
import { adminLogsApi } from '@/api/admin/logs'

export const adminLogsKeys = {
  all: ['admin', 'logs'] as const,
}

export function useAdminLogs() {
  return useQuery({
    queryKey: adminLogsKeys.all,
    queryFn: adminLogsApi.getAll,
  })
}
