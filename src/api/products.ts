import { supabase } from '@/lib/supabase'
import { transformProduct } from '@/lib/helpers'
import type { Product, DBProductWithRelations } from '@/types/storefront'

export interface GetProductsParams {
  category?: string
  limit?: number
  sortBy?: 'created_at' | 'base_price'
  ascending?: boolean
}

export const productsApi = {
  getStorefrontProducts: async (params?: GetProductsParams): Promise<Product[]> => {
    let query = supabase
      .from('products')
      .select('*, product_variants(*), product_images(*)')

    if (params?.category) {
      query = query.eq('category', params.category)
    }

    if (params?.sortBy) {
      query = query.order(params.sortBy, { ascending: params?.ascending ?? false })
    }

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const dbProducts = data as unknown as DBProductWithRelations[]
    return dbProducts.map(transformProduct)
  },

  getProductById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(*)')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const dbProduct = data as unknown as DBProductWithRelations
    return transformProduct(dbProduct)
  },
}