import { supabase } from '@/lib/supabase'
import { transformProduct } from '@/lib/helpers'
import type { Product, DBProductWithRelations } from '@/types/storefront'

export interface GetProductsParams {
  category?: string
  search?: string
  limit?: number
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name'
}

export const productsApi = {
  getStorefrontProducts: async (params?: GetProductsParams): Promise<Product[]> => {
    // 1. MUST enforce is_active for customer storefront
    let query = supabase
      .from('products')
      .select('*, product_variants(*), product_images(*)')
      .eq('is_active', true)

    // 2. Filter by category if not 'all'
    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category)
    }

    // 3. Search by name or description
    if (params?.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`
      query = query.or(`name.ilike.${term},description.ilike.${term}`)
    }

    // 4. Flexible Sorting
    switch (params?.sort) {
      case 'price-asc':
        query = query.order('base_price', { ascending: true })
        break
      case 'price-desc':
        query = query.order('base_price', { ascending: false })
        break
      case 'name':
        query = query.order('name', { ascending: true })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const dbProducts = (data ?? []) as unknown as DBProductWithRelations[]
    return dbProducts.map(transformProduct)
  },

  getProductById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(*)')
      .eq('id', id)
      .eq('is_active', true) // Guard draft pages from being accessed
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const dbProduct = data as unknown as DBProductWithRelations
    return transformProduct(dbProduct)
  },
}