import { useQuery } from '@tanstack/react-query'
import { productsApi, type GetProductsParams } from '@/api/products'
import type { Product } from '@/types/storefront'

export const productKeys = {
  all: ['products'] as const,
  storefront: (params?: GetProductsParams) => [...productKeys.all, 'storefront', params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
}

export function useProducts(params?: GetProductsParams) {
  return useQuery<Product[], Error>({
    queryKey: productKeys.storefront(params),
    queryFn: () => productsApi.getStorefrontProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useProduct(id: string) {
  return useQuery<Product, Error>({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProductById(id),
    staleTime: 1000 * 60 * 5,
  })
}