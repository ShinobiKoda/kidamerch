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

export function useToggleAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => 
      adminManageApi.toggleActive(id, is_active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminManageKeys.all })
    },
  })
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminManageApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminManageKeys.all })
    },
  })
}
