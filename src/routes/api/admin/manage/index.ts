import { createFileRoute } from '@tanstack/react-router'
import { requireRole, AuthError } from '@/server/utils/require-role'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { getAdminInviteEmailHtml } from '@/lib/email-templates'
import { getRequiredEnv } from '@/lib/get-required-env'

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

          const authMap = new Map(authData.users.map(u => [u.id, u.email]))

          const admins = profiles.map(p => ({
            ...p,
            email: authMap.get(p.id) || 'Unknown',
          }))

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

          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email,
          })

          if (linkError) throw linkError

          const inviteLink = linkData.properties?.action_link
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
            from: 'KidaMerch <noreply@kidamerch.com>',
            to: email,
            subject: 'You have been invited to KidaMerch Admin',
            html: getAdminInviteEmailHtml(inviteLink),
          })

          if (resendError) {
            console.error('Failed to send email:', resendError)
          }

          return Response.json({ success: true, email })
        } catch (e: any) {
          if (e instanceof AuthError) return e
          return Response.json({ message: e.message }, { status: 500 })
        }
      }
    }
  }
})
