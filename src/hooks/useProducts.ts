import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/api/products'
import type { Product } from '@/types/storefront'

export const productKeys = {
  all: ['products'] as const,
  storefront: () => [...productKeys.all, 'storefront'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
}

export function useProducts() {
  return useQuery<Product[], Error>({
    queryKey: productKeys.storefront(),
    queryFn: productsApi.getStorefrontProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh time
  })
}