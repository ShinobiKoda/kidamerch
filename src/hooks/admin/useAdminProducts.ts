import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminProductsApi } from '@/api/admin/products'
import type { Product } from '@/types/storefront'
import type { CreateProductInput, UpdateProductInput } from '@/types/admin'

export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  detail: (id: string) => [...adminProductKeys.all, 'detail', id] as const,
}

export function useAdminProducts() {
  return useQuery<Product[], Error>({
    queryKey: adminProductKeys.all,
    queryFn: adminProductsApi.getAll,
    staleTime: 1000 * 60,
  })
}

export function useAdminProduct(id: string) {
  return useQuery<Product, Error>({
    queryKey: adminProductKeys.detail(id),
    queryFn: () => adminProductsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation<Product, Error, CreateProductInput>({
    mutationFn: adminProductsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductKeys.all }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation<Product, Error, { id: string; input: UpdateProductInput }>({
    mutationFn: ({ id, input }) => adminProductsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductKeys.all }),
  })
}

export function useDeleteProducts() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string[]>({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => adminProductsApi.remove(id)))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductKeys.all }),
  })
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient()
  return useMutation<Product, Error, Product>({
    mutationFn: (product) =>
      adminProductsApi.create({
        name: `${product.name} (Copy)`,
        description: product.description,
        basePrice: product.basePrice,
        category: product.category,
        animeSeries: product.animeSeries,
        isActive: false, // duplicates land as draft, not live
        variants: product.variants?.map((v) => ({
          size: v.size,
          color: v.color,
          design: v.design,
          sku: null, // SKUs should stay unique — drop rather than collide
          priceOverride: v.priceOverride,
          stock: v.stock,
        })),
        imageUrls: product.images?.map((img) => img.url),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductKeys.all }),
  })
}

export function useBulkSetActive() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { products: Product[]; isActive: boolean }>({
    mutationFn: async ({ products, isActive }) => {
      await Promise.all(
        products.map((p) =>
          adminProductsApi.update(p.id, {
            name: p.name,
            description: p.description,
            basePrice: p.basePrice,
            category: p.category,
            animeSeries: p.animeSeries,
            isActive,
            variants: p.variants?.map((v) => ({
              size: v.size,
              color: v.color,
              design: v.design,
              sku: v.sku,
              priceOverride: v.priceOverride,
              stock: v.stock,
            })),
            imageUrls: p.images?.map((img) => img.url),
          }),
        ),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductKeys.all }),
  })
}