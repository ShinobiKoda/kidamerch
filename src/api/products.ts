
import { supabase } from '@/lib/supabase';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants(*),
      product_images(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  console.log(data)
  return data
}