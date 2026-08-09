import { createError, type H3Event, getHeader } from 'h3'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Role = 'admin' | 'superadmin'
const RANK: Record<Role, number> = { admin: 1, superadmin: 2 }

export async function requireRole(event: H3Event, minRole: Role = 'admin') {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing auth token' })
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData.user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired session' })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, is_active')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile?.role || !profile.is_active) {
    throw createError({ statusCode: 403, statusMessage: 'Not authorized' })
  }

  if (RANK[profile.role as Role] < RANK[minRole]) {
    throw createError({ statusCode: 403, statusMessage: `Requires ${minRole} role` })
  }

  return { user: userData.user, role: profile.role as Role }
}