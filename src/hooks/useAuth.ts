import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { authApi, type AuthState } from '@/api/auth'

export const authKeys = {
  state: ['auth', 'state'] as const,
}

export function useAuth() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<AuthState, Error>({
    queryKey: authKeys.state,
    queryFn: authApi.getState,
    staleTime: Infinity,
  })

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: authKeys.state })
    })
    return () => sub.subscription.unsubscribe()
  }, [queryClient])

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signIn(email, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.state }),
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.state }),
  })

  const role = data?.role ?? null

  return {
    session: data?.session ?? null,
    role,
    isAdmin: role === 'admin' || role === 'superadmin',
    isSuperAdmin: role === 'superadmin',
    ready: !isLoading,
    login: (email: string, password: string) => loginMutation.mutateAsync({ email, password }),
    logout: () => logoutMutation.mutateAsync(),
    loginError: loginMutation.error,
  }
}