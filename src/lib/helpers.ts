import type { Product, DBProductWithRelations } from '@/types/storefront'

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