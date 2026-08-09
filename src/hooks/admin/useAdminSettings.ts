import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminSettingsApi } from '@/api/admin/settings'
import type { StoreSettings, UpdateStoreSettingsInput } from '@/types/admin'

export const adminSettingsKeys = {
  all: ['admin', 'settings'] as const,
}

export function useStoreSettings() {
  return useQuery<StoreSettings, Error>({
    queryKey: adminSettingsKeys.all,
    queryFn: adminSettingsApi.get,
    staleTime: 1000 * 60 * 5, // changes rarely, no need to refetch often
  })
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient()
  return useMutation<StoreSettings, Error, UpdateStoreSettingsInput>({
    mutationFn: adminSettingsApi.update,
    onSuccess: (settings) => queryClient.setQueryData(adminSettingsKeys.all, settings),
  })
}