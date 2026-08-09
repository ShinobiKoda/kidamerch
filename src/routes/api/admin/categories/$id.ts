// src/routes/api/admin/categories/$id.ts
import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import type { Category } from '@/types/admin'

export const Route = createFileRoute('/api/admin/categories/$id')({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json()) as { name?: string }

          if (!body?.name?.trim()) {
            return Response.json({ message: 'Category name is required' }, { status: 400 })
          }

          // ON UPDATE CASCADE on products.category means every product
          // referencing the old name is repointed automatically.
          const { data, error } = await supabaseAdmin
            .from('categories')
            .update({ name: body.name.trim() })
            .eq('id', params.id)
            .select()
            .single()

          if (error) {
            if (error.code === '23505') {
              return Response.json({ message: 'A category with this name already exists' }, { status: 409 })
            }
            throw new Error(`Database Error: ${error.message}`)
          }

          const category: Category = { id: data.id, name: data.name, createdAt: data.created_at }
          return Response.json(category)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json().catch(() => null)) as { reassignTo?: string } | null
          const reassignTo = body?.reassignTo?.trim()

          const { data: category, error: fetchError } = await supabaseAdmin
            .from('categories')
            .select('name')
            .eq('id', params.id)
            .single()

          if (fetchError || !category) {
            return Response.json({ message: 'Category not found' }, { status: 404 })
          }

          if (reassignTo) {
            // Move affected products to the new category first, so the
            // FK constraint doesn't block deleting the old one.
            const { error: reassignError } = await supabaseAdmin
              .from('products')
              .update({ category: reassignTo })
              .eq('category', category.name)

            if (reassignError) {
              throw new Error(`Failed to reassign products: ${reassignError.message}`)
            }
          } else {
            // No target given — remove products in this category outright.
            const { error: deleteProductsError } = await supabaseAdmin
              .from('products')
              .delete()
              .eq('category', category.name)

            if (deleteProductsError) {
              throw new Error(`Failed to delete products: ${deleteProductsError.message}`)
            }
          }

          const { error: deleteError } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', params.id)

          if (deleteError) throw new Error(`Database Error: ${deleteError.message}`)

          return Response.json({ id: params.id, deleted: true })
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },
    },
  },
})