import { useQuery } from '@tanstack/react-query'
import { productsApi, type GetProductsParams } from '@/api/products'
import type { Product } from '@/types/storefront'

export const productKeys = {
  all: ['products'] as const,
  // Normalizing params ensures clean cache keys even when undefined is passed
  storefront: (params?: GetProductsParams) => [...productKeys.all, 'storefront', params ?? {}] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
}

export function useProducts(params?: GetProductsParams) {
  return useQuery<Product[], Error>({
    queryKey: productKeys.storefront(params),
    queryFn: () => productsApi.getStorefrontProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

export function useProduct(id: string) {
  return useQuery<Product, Error>({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProductById(id),
    enabled: Boolean(id), // Prevents fetching when id is undefined/empty
    staleTime: 1000 * 60 * 5,
  })
}

export function useHeroProduct() {
  return useQuery({
    queryKey: ['products', 'hero'],
    queryFn: productsApi.getHeroProduct,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

// src/hooks/useProducts.ts — add

export function useActiveProductCount() {
  return useQuery<number, Error>({
    queryKey: ['products', 'active-count'],
    queryFn: productsApi.getActiveProductCount,
    staleTime: 1000 * 60 * 15,
  })
}