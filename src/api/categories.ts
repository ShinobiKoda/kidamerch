import { supabase } from '@/lib/supabase'

export type StorefrontCategory = {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
}

export const categoriesApi = {
  getStorefrontCategories: async (): Promise<StorefrontCategory[]> => {
    // 1. Fetch categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true })

    if (catError) {
      throw new Error(catError.message)
    }

    if (!categories || categories.length === 0) {
      return []
    }

    // 2. Fetch one product image per category to serve as category cover tile
    const categoryNames = categories.map((c) => c.name)

    const { data: productsData } = await supabase
      .from('products')
      .select('category, product_images(url)')
      .in('category', categoryNames)
      .eq('is_active', true)

    // Build image lookup map per category name
    const categoryImageMap = new Map<string, string>()

    productsData?.forEach((p) => {
      if (!categoryImageMap.has(p.category) && p.product_images?.[0]?.url) {
        categoryImageMap.set(p.category, p.product_images[0].url)
      }
    })

    // 3. Map to storefront shape
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.name.toLowerCase().replace(/\s+/g, '-'),
      imageUrl: categoryImageMap.get(c.name) ?? null,
    }))
  },
}