import type { Product } from '@/types/storefront'

export type AdminProduct = Product

export interface CreateVariantInput {
  size?: string | null
  color?: string | null
  design?: string | null
  sku?: string | null
  priceOverride?: number | null
  stock?: number
}

export interface CreateProductInput {
  name: string
  description?: string | null
  basePrice: number
  category: string
  animeSeries?: string | null
  isActive?: boolean
  variants?: CreateVariantInput[]
  imageUrls?: string[]
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface CreateCategoryInput {
  name: string
}

export type UpdateProductInput = CreateProductInput