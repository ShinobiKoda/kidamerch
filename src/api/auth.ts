import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export type AdminRole = 'admin' | 'superadmin'

export interface AuthState {
  session: Session | null
  role: AdminRole | null
}

async function fetchRole(userId: string): Promise<AdminRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', userId)
    .single()

  if (error || !data?.is_active) return null
  return (data.role as AdminRole | null) ?? null
}

export const authApi = {
  getState: async (): Promise<AuthState> => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return { session: null, role: null }
    const role = await fetchRole(data.session.user.id)
    return { session: data.session, role }
  },

  signIn: async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}