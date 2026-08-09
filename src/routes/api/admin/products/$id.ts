import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import { transformProduct } from '@/lib/helpers'
import type { DBProductWithRelations, Product } from '@/types/storefront'
import type { UpdateProductInput } from '@/types/admin'

export const Route = createFileRoute('/api/admin/products/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireRole(request, 'admin')
          const product = await getProduct(params.id)
          return Response.json(product)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      PUT: async ({ request, params }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json()) as UpdateProductInput
          const product = await updateProduct(params.id, body)
          return Response.json(product)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          await requireRole(request, 'admin')
          const { error } = await supabaseAdmin.from('products').delete().eq('id', params.id)
          if (error) throw new Error(`Database Error: ${error.message}`)
          return Response.json({ id: params.id, deleted: true })
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})

async function getProduct(id: string): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`*, product_variants(*), product_images(*)`)
    .eq('id', id)
    .single()

  if (error) throw new Error(`Product not found: ${error.message}`)
  return transformProduct(data as unknown as DBProductWithRelations)
}

async function updateProduct(id: string, body: UpdateProductInput): Promise<Product> {
  if (!body?.name || body.basePrice == null || !body.category) {
    throw new Error('name, basePrice, and category are required')
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

  if (productError) throw new Error(`Database Error: ${productError.message}`)

  const { error: deleteVariantsError } = await supabaseAdmin
    .from('product_variants')
    .delete()
    .eq('product_id', id)

  if (deleteVariantsError) throw new Error(`Database Error: ${deleteVariantsError.message}`)

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

  if (insertVariantsError) throw new Error(`Database Error: ${insertVariantsError.message}`)

  const { error: deleteImagesError } = await supabaseAdmin
    .from('product_images')
    .delete()
    .eq('product_id', id)

  if (deleteImagesError) throw new Error(`Database Error: ${deleteImagesError.message}`)

  if (body.imageUrls?.length) {
    const { error: insertImagesError } = await supabaseAdmin.from('product_images').insert(
      body.imageUrls.map((url, i) => ({ product_id: id, url, position: i })),
    )
    if (insertImagesError) throw new Error(`Database Error: ${insertImagesError.message}`)
  }

  return getProduct(id)
}