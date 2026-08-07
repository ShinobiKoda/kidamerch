// src/types/storefront.ts
import type { Database } from './database.types' // path to your generated types

// Raw DB Row Types
export type DBProduct = Database['public']['Tables']['products']['Row']
export type DBVariant = Database['public']['Tables']['product_variants']['Row']
export type DBImage = Database['public']['Tables']['product_images']['Row']

// Combined Query Output Shape (for Nitro transformer)
export type DBProductWithRelations = DBProduct & {
  product_variants: DBVariant[]
  product_images: DBImage[]
}

// Clean Frontend DTOs (CamelCase API Contracts)
export interface ProductVariant {
  id: string
  productId: string
  size: string | null
  color: string | null
  design: string | null
  sku: string | null
  priceOverride: number | null
  stock: number
  createdAt: string | null
}

export interface ProductImage {
  id: string
  productId: string
  variantId: string | null
  url: string
  position: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  basePrice: number
  category: string
  animeSeries: string | null
  isActive: boolean
  createdAt: string | null
  variants: ProductVariant[]
  images: ProductImage[]
}