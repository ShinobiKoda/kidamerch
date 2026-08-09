import { useQuery } from '@tanstack/react-query'
import { categoriesApi, type StorefrontCategory } from '@/api/categories'

export const categoryKeys = {
  all: ['categories'] as const,
  storefront: () => [...categoryKeys.all, 'storefront'] as const,
}

export function useCategories() {
  return useQuery<StorefrontCategory[], Error>({
    queryKey: categoryKeys.storefront(),
    queryFn: categoriesApi.getStorefrontCategories,
    staleTime: 1000 * 60 * 10,
  })
}