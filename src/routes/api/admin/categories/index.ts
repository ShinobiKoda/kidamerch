import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireRole, AuthError } from '@/server/utils/require-role'
import type { Category, CreateCategoryInput } from '@/types/admin'

export const Route = createFileRoute('/api/admin/categories/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const { data, error } = await supabaseAdmin
            .from('categories')
            .select('*')
            .order('name', { ascending: true })

          if (error) throw new Error(`Database Error: ${error.message}`)

          const categories: Category[] = data.map((c) => ({
            id: c.id,
            name: c.name,
            createdAt: c.created_at,
          }))
          return Response.json(categories)
        } catch (err) {
          if (err instanceof AuthError) return err
          return Response.json({ message: (err as Error).message }, { status: 500 })
        }
      },

      POST: async ({ request }) => {
        try {
          await requireRole(request, 'admin')
          const body = (await request.json()) as CreateCategoryInput

          if (!body?.name?.trim()) {
            return Response.json({ message: 'Category name is required' }, { status: 400 })
          }

          const { data, error } = await supabaseAdmin
            .from('categories')
            .insert({ name: body.name.trim() })
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
    },
  },
})