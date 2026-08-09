import { defineHandler, getRouterParam, readBody, HTTPError } from 'h3'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole } from '@/server/utils/require-role'
import { transformProduct } from '@/lib/helpers'
import type { DBProductWithRelations, Product } from '@/types/storefront'
import type { UpdateProductInput } from '@/types/admin'

export default defineHandler(async (event) => {
  await requireRole(event, 'admin')

  const id = getRouterParam(event, 'id')
  if (!id) throw HTTPError.status(400, 'Product id is required')

  if (event.req.method === 'GET') return getProduct(id)
  if (event.req.method === 'PUT') return updateProduct(id, event)
  if (event.req.method === 'DELETE') return deleteProduct(id)
  throw HTTPError.status(405, 'Method not allowed')
})

async function getProduct(id: string): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`*, product_variants(*), product_images(*)`)
    .eq('id', id)
    .single()

  if (error) throw HTTPError.status(404, `Product not found: ${error.message}`)
  return transformProduct(data as unknown as DBProductWithRelations)
}

async function updateProduct(id: string, event: any): Promise<Product> {
  const body = await readBody<UpdateProductInput>(event)

  if (!body?.name || body.basePrice == null || !body.category) {
    throw HTTPError.status(400, 'name, basePrice, and category are required')
  }

  const { error: productError } = await supabaseAdmin
    .from('products')
    .update({
      name: body.name,
      description: body.description ?? null,
      base_price: body.basePrice,
      category: body.category,
      anime_series: body.animeSeries ?? null,
      is_active: body.isActive ?? true,
    })
    .eq('id', id)

  if (productError) throw HTTPError.status(500, `Database Error: ${productError.message}`)

  const { error: deleteVariantsError } = await supabaseAdmin
    .from('product_variants')
    .delete()
    .eq('product_id', id)

  if (deleteVariantsError) throw HTTPError.status(500, `Database Error: ${deleteVariantsError.message}`)

  const variantRows = body.variants?.length
    ? body.variants
    : [{ size: null, color: null, design: null, sku: null, priceOverride: null, stock: 0 }]

  const { error: insertVariantsError } = await supabaseAdmin.from('product_variants').insert(
    variantRows.map((v) => ({
      product_id: id,
      size: v.size ?? null,
      color: v.color ?? null,
      design: v.design ?? null,
      sku: v.sku ?? null,
      price_override: v.priceOverride ?? null,
      stock: v.stock ?? 0,
    })),
  )

  if (insertVariantsError) throw HTTPError.status(500, `Database Error: ${insertVariantsError.message}`)

  const { error: deleteImagesError } = await supabaseAdmin
    .from('product_images')
    .delete()
    .eq('product_id', id)

  if (deleteImagesError) throw HTTPError.status(500, `Database Error: ${deleteImagesError.message}`)

  if (body.imageUrls?.length) {
    const { error: insertImagesError } = await supabaseAdmin.from('product_images').insert(
      body.imageUrls.map((url, i) => ({ product_id: id, url, position: i })),
    )
    if (insertImagesError) throw HTTPError.status(500, `Database Error: ${insertImagesError.message}`)
  }

  return getProduct(id)
}

async function deleteProduct(id: string): Promise<{ id: string; deleted: true }> {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) throw HTTPError.status(500, `Database Error: ${error.message}`)
  return { id, deleted: true }
}