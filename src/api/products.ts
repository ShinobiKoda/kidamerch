// src/api/products.ts
import { apiFetch } from './client'
import type { Product } from '@/types/storefront'

export const productsApi = {
  getStorefrontProducts: () => apiFetch<Product[]>('/products'),
  getProductById: (id: string) => apiFetch<Product>(`/products/${id}`),
}