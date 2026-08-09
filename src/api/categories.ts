import { supabase } from '@/lib/supabase'

export type StorefrontCategory = {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
}

export const categoriesApi = {
  getStorefrontCategories: async (): Promise<StorefrontCategory[]> => {
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true })

    if (catError) throw new Error(catError.message)
    if (!categories || categories.length === 0) return []

    const categoryNames = categories.map((c) => c.name)

    const { data: productsData } = await supabase
      .from('products')
      .select('category, product_images(url)')
      .in('category', categoryNames)
      .eq('is_active', true)

    const categoryImageMap = new Map<string, string>()
    const categoriesWithStock = new Set<string>()

    productsData?.forEach((p) => {
      categoriesWithStock.add(p.category)
      if (!categoryImageMap.has(p.category) && p.product_images?.[0]?.url) {
        categoryImageMap.set(p.category, p.product_images[0].url)
      }
    })

    // Only surface categories that actually have something to show —
    // an empty category tile is a dead end on the landing page.
    return categories
      .filter((c) => categoriesWithStock.has(c.name))
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.name.toLowerCase().replace(/\s+/g, '-'),
        imageUrl: categoryImageMap.get(c.name) ?? null,
      }))
  },
}