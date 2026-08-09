import { supabaseAdmin } from '@/lib/supabase-admin'

type Role = 'admin' | 'superadmin'
const RANK: Record<Role, number> = { admin: 1, superadmin: 2 }

export class AuthError extends Response {
  constructor(status: number, message: string) {
    super(JSON.stringify({ message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function requireRole(request: Request, minRole: Role = 'admin') {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) throw new AuthError(401, 'Missing auth token')

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData.user) throw new AuthError(401, 'Invalid or expired session')

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, is_active')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile?.role || !profile.is_active) {
    throw new AuthError(403, 'Not authorized')
  }

  if (RANK[profile.role as Role] < RANK[minRole]) {
    throw new AuthError(403, `Requires ${minRole} role`)
  }

  return { user: userData.user, role: profile.role as Role }
}