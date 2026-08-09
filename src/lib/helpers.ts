import type { Product, DBProductWithRelations } from '@/types/storefront'
import type { Order, OrderHistoryEntry, OrderItem, AdminEvent, EventKind, EventStatus } from '@/types/admin'
import type { Database } from '@/types/database.types'
import type { StoreSettings } from '@/types/admin'


type DBEventRow = Database['public']['Tables']['events']['Row']

export function transformEvent(dbEvent: DBEventRow): AdminEvent {
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    kind: dbEvent.kind as EventKind,
    date: dbEvent.date,
    location: dbEvent.location,
    description: dbEvent.description ?? '',
    cover: dbEvent.cover ?? '',
    gallery: dbEvent.gallery ?? [],
    status: dbEvent.status as EventStatus,
    featured: dbEvent.featured,
    createdAt: dbEvent.created_at,
  }
}

export function transformProduct(dbProduct: DBProductWithRelations): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    basePrice: dbProduct.base_price,
    category: dbProduct.category,
    animeSeries: dbProduct.anime_series,
    isActive: dbProduct.is_active ?? true,
    createdAt: dbProduct.created_at,
    variants: (dbProduct.product_variants || []).map((v) => ({
      id: v.id,
      productId: v.product_id,
      size: v.size,
      color: v.color,
      design: v.design,
      sku: v.sku,
      priceOverride: v.price_override,
      stock: v.stock,
      createdAt: v.created_at,
    })),
   images: (dbProduct.product_images || []).map((img, idx) => ({
      id: img.id,
      productId: img.product_id,
      variantId: img.variant_id,
      url: img.url,
      position: img.position ?? idx, 
    })),
  }
}


const STATUS_LABELS: Record<string, Order['status']> = {
  pending: 'pending',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
  refunded: 'refunded',
}

export function transformOrder(
  dbOrder: any,
  items: any[],
  history: any[],
  resolvedEmail: string,
  resolvedName: string,
): Order {
  const itemRows: OrderItem[] = items.map((it) => ({
    id: it.id,
    variantId: it.variant_id,
    productName: it.product_name,
    variantDetails: it.variant_details,
    quantity: it.quantity,
    priceAtOrder: Number(it.price_at_order),
  }))

  const historyRows: OrderHistoryEntry[] = history
    .map((h) => ({ label: h.label, at: h.at }))
    .sort((a, b) => +new Date(a.at) - +new Date(b.at))

  return {
    id: dbOrder.id,
    customerName: dbOrder.guest_name ?? resolvedName,
    customerEmail: dbOrder.guest_email ?? resolvedEmail,
    customerPhone: dbOrder.guest_phone ?? null,
    status: STATUS_LABELS[dbOrder.status] ?? 'pending',
    paymentStatus: dbOrder.payment_status ?? 'pending',
    subtotal: Number(dbOrder.subtotal ?? dbOrder.total_estimate),
    shippingCost: Number(dbOrder.shipping_cost ?? 0),
    tax: Number(dbOrder.tax ?? 0),
    total: Number(dbOrder.total_estimate),
    shippingAddress: dbOrder.shipping_address,
    trackingNumber: dbOrder.tracking_number,
    reason: dbOrder.reason,
    notes: dbOrder.notes,
    whatsappSentAt: dbOrder.whatsapp_sent_at,
    items: itemRows,
    history: historyRows,
    createdAt: dbOrder.created_at,
  }
}


type DBStoreSettingsRow = Database['public']['Tables']['store_settings']['Row']

export function transformStoreSettings(row: DBStoreSettingsRow): StoreSettings {
  return {
    lowStockThreshold: row.low_stock_threshold,
  }
}