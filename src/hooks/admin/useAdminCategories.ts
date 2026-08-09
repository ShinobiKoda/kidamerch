// src/hooks/admin/useAdminCategories.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminCategoriesApi } from '@/api/admin/categories'
import { adminProductKeys } from '@/hooks/admin/useAdminProducts'
import type { Category, CreateCategoryInput } from '@/types/admin'

export const adminCategoryKeys = {
  all: ['admin', 'categories'] as const,
}

export function useAdminCategories() {
  return useQuery<Category[], Error>({
    queryKey: adminCategoryKeys.all,
    queryFn: adminCategoriesApi.getAll,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation<Category, Error, CreateCategoryInput>({
    mutationFn: adminCategoriesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all }),
  })
}

export function useRenameCategory() {
  const queryClient = useQueryClient()
  return useMutation<Category, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => adminCategoriesApi.rename(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation<{ id: string; deleted: true }, Error, { id: string; reassignTo?: string | undefined }>({
    mutationFn: ({ id, reassignTo }) => adminCategoriesApi.remove(id, reassignTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}