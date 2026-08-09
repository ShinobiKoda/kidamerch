import type { Product } from '@/types/storefront'

export type AdminProduct = Product
// src/types/admin.ts — add

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'


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


export interface OrderHistoryEntry {
  label: string
  at: string
}

export interface OrderItem {
  id: string
  variantId: string
  productName: string
  variantDetails: string | null
  quantity: number
  priceAtOrder: number
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  shippingAddress: string | null
  trackingNumber: string | null
  reason: string | null
  notes: string | null
  whatsappSentAt: string | null
  items: OrderItem[]
  history: OrderHistoryEntry[]
  createdAt: string
}

export interface UpdateOrderInput {
  status?: OrderStatus | undefined
  paymentStatus?: PaymentStatus | undefined
  trackingNumber?: string | undefined
  reason?: string | undefined
  historyLabel?: string | undefined
}

export type UpdateProductInput = CreateProductInput