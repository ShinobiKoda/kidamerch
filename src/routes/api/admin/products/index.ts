import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import { transformProduct } from '@/lib/helpers'
import type { DBProductWithRelations, Product } from '@/types/storefront'
import type { CreateProductInput } from '@/types/admin'

export const Route = createFileRoute('/api/admin/products/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const products = await getProducts()
          return Response.json(products)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      POST: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json()) as CreateProductInput
          const product = await createProduct(body)
          return Response.json(product)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`*, product_variants(*), product_images(*)`)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Database Error: ${error.message}`)
  return (data as unknown as DBProductWithRelations[]).map(transformProduct)
}

async function createProduct(body: CreateProductInput): Promise<Product> {
  if (!body?.name || body.basePrice == null || !body.category) {
    throw new Error('name, basePrice, and category are required')
  }

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert({
      name: body.name,
      description: body.description ?? null,
      base_price: body.basePrice,
      category: body.category,
      anime_series: body.animeSeries ?? null,
      is_active: body.isActive ?? true,
    })
    .select()
    .single()

  if (productError) throw new Error(`Database Error: ${productError.message}`)

  const variantRows = body.variants?.length
    ? body.variants
    : [{ size: null, color: null, design: null, sku: null, priceOverride: null, stock: 0 }]

  const { error: variantsError } = await supabaseAdmin.from('product_variants').insert(
    variantRows.map((v) => ({
      product_id: product.id,
      size: v.size ?? null,
      color: v.color ?? null,
      design: v.design ?? null,
      sku: v.sku ?? null,
      price_override: v.priceOverride ?? null,
      stock: v.stock ?? 0,
    })),
  )

  if (variantsError) throw new Error(`Product created but variants failed: ${variantsError.message}`)

  if (body.imageUrls?.length) {
    const { error: imagesError } = await supabaseAdmin.from('product_images').insert(
      body.imageUrls.map((url, i) => ({ product_id: product.id, url, position: i })),
    )
    if (imagesError) throw new Error(`Product created but images failed: ${imagesError.message}`)
  }

  const { data: full, error: fetchError } = await supabaseAdmin
    .from('products')
    .select(`*, product_variants(*), product_images(*)`)
    .eq('id', product.id)
    .single()

  if (fetchError) throw new Error(`Database Error: ${fetchError.message}`)
  return transformProduct(full as unknown as DBProductWithRelations)
}