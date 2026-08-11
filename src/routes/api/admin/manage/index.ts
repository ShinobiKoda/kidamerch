import { createFileRoute } from '@tanstack/react-router'
import { requireRole, AuthError } from '@/server/utils/require-role'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { getAdminInviteEmailHtml } from '@/lib/email-templates'
import { getRequiredEnv } from '@/lib/get-required-env'
import { logAdminAction } from '@/server/utils/audit-logger'

const resend = new Resend(getRequiredEnv('RESEND_API_KEY'))

export const Route = createFileRoute('/api/admin/manage/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          await requireRole(request, 'superadmin')
          
          const { data: profiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .in('role', ['admin', 'superadmin'])
            .order('role', { ascending: false })

          if (profileError) throw profileError

          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
          if (authError) throw authError

          const authMap = new Map(authData.users.map(u => [u.id, { email: u.email, last_sign_in_at: u.last_sign_in_at }]))

          const admins = profiles.map(p => {
            const authUser = authMap.get(p.id)
            const inviterUser = p.invited_by ? authMap.get(p.invited_by) : null
            return {
              ...p,
              email: authUser?.email || 'Unknown',
              last_sign_in_at: authUser?.last_sign_in_at,
              invited_by_email: inviterUser?.email || 'System',
            }
          })

          return Response.json(admins)
        } catch (e: any) {
          if (e instanceof AuthError) return e
          return Response.json({ message: e.message }, { status: 500 })
        }
      },

      POST: async ({ request }: { request: Request }) => {
        try {
          const { user } = await requireRole(request, 'superadmin')
          const body = await request.json()
          const email = body.email as string

          if (!email) return Response.json({ message: 'Email required' }, { status: 400 })

          const origin = new URL(request.url).origin
          
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email,
            options: {
              redirectTo: `${origin}/admin/set-password`
            }
          })

          if (linkError) throw linkError

          let inviteLink = linkData.properties?.action_link
  
          if (inviteLink && inviteLink.includes('localhost:3000') && !origin.includes('localhost:3000')) {
            inviteLink = inviteLink.replace('localhost:3000', new URL(origin).host)
          }
          const newUserId = linkData.user?.id

          if (!inviteLink || !newUserId) {
            throw new Error('Failed to generate invite link')
          }

          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
              role: 'admin',
              invited_by: user.id,
              invited_at: new Date().toISOString(),
            })
            .eq('id', newUserId)
            
          if (profileError) throw profileError

          const { error: resendError } = await resend.emails.send({
            from: 'KidaMerch <onboarding@sir-p.tech>',
            to: email,
            subject: 'You have been invited to KidaMerch Admin',
            html: getAdminInviteEmailHtml(inviteLink),
          })

          if (resendError) {
            console.error('Failed to send email:', resendError)
            throw new Error(`Failed to send invite email: ${resendError.message}`)
          }

          await logAdminAction({
            adminId: user.id,
            action: 'INVITE_ADMIN',
            entityType: 'profile',
            entityId: newUserId,
            details: { email }
          })

          return Response.json({ success: true, email })
        } catch (e: any) {
          if (e instanceof AuthError) return e
          return Response.json({ message: e.message }, { status: 500 })
        }
      },

      PUT: async ({ request }: { request: Request }) => {
        try {
          const { user } = await requireRole(request, 'superadmin')
          const body = await request.json()
          const { id, is_active } = body as { id: string; is_active: boolean }

          if (!id || typeof is_active !== 'boolean') {
            return Response.json({ message: 'Invalid payload' }, { status: 400 })
          }

          const { error } = await supabaseAdmin
            .from('profiles')
            .update({ is_active })
            .eq('id', id)
            .in('role', ['admin', 'superadmin']) // Ensure they only modify admins

          if (error) throw error

          await logAdminAction({
            adminId: user.id,
            action: is_active ? 'RESTORE_ADMIN' : 'REVOKE_ADMIN',
            entityType: 'profile',
            entityId: id,
          })

          return Response.json({ success: true, id, is_active })
        } catch (e: any) {
          if (e instanceof AuthError) return e
          return Response.json({ message: e.message }, { status: 500 })
        }
      },

      DELETE: async ({ request }: { request: Request }) => {
        try {
          const { user } = await requireRole(request, 'superadmin')
          const body = await request.json()
          const { id } = body as { id: string }

          if (!id) {
            return Response.json({ message: 'User ID is required' }, { status: 400 })
          }

          // Let's change the user role back to null in the database rather than deleting their account
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
              role: null,
              invited_by: null,
              invited_at: null,
              is_active: true // Reset to true so they can login as regular user
            })
            .eq('id', id)
            .in('role', ['admin', 'superadmin'])

          if (profileError) throw profileError

          await logAdminAction({
            adminId: user.id,
            action: 'REMOVE_ADMIN',
            entityType: 'profile',
            entityId: id,
          })

          return Response.json({ success: true, id })
        } catch (e: any) {
          if (e instanceof AuthError) return e
          return Response.json({ message: e.message }, { status: 500 })
        }
      }
    }
  }
})
