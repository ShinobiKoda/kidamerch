import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminManageApi } from '@/api/admin/manage'

export const adminManageKeys = {
  all: ['admin', 'manage'] as const,
}

export function useAdmins() {
  return useQuery({
    queryKey: adminManageKeys.all,
    queryFn: adminManageApi.getAll,
  })
}

export function useInviteAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminManageApi.invite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminManageKeys.all })
    },
  })
}
