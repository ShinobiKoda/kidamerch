// src/server/api/products/index.ts
import { defineEventHandler, createError } from 'h3'
import { supabaseAdmin } from '~/lib/supabase-admin'
import type { Database } from '~/types/database'
import type { Product, DBProductWithRelations } from '~/types/storefront'

export default defineEventHandler(async (event): Promise<Product[]> => {
  // Pass Database type to supabaseAdmin for strict query autocompletion
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      product_variants(*),
      product_images(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Database Error: ${error.message}`,
    })
  }

  const rawProducts = (data || []) as unknown as DBProductWithRelations[]

  // DTO Mapping
  return rawProducts.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    basePrice: product.base_price,
    category: product.category,
    animeSeries: product.anime_series,
    isActive: product.is_active ?? true,
    createdAt: product.created_at,
    variants: (product.product_variants || []).map((v) => ({
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
    images: (product.product_images || [])
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((img) => ({
        id: img.id,
        productId: img.product_id,
        variantId: img.variant_id,
        url: img.url,
        position: img.position ?? 0,
      })),
  }))
})