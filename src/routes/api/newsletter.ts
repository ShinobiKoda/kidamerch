import { createFileRoute } from '@tanstack/react-router'
import { Resend } from 'resend'
import { getNewsletterWelcomeEmailHtml } from '@/lib/email-templates'
import { getRequiredEnv } from '@/lib/get-required-env'

const resend = new Resend(getRequiredEnv('RESEND_API_KEY'))

export const Route = createFileRoute('/api/newsletter')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const email = body.email as string

          if (!email) return Response.json({ message: 'Email required' }, { status: 400 })

          const { error: resendError } = await resend.emails.send({
            from: 'KidaMerch <noreply@kidamerch.com>',
            to: email,
            subject: 'Welcome to KidaMerch',
            html: getNewsletterWelcomeEmailHtml(),
          })

          if (resendError) {
            console.error('Failed to send newsletter welcome email:', resendError)
            throw resendError
          }

          return Response.json({ success: true, email })
        } catch (e: any) {
          return Response.json({ message: e.message || 'Failed to subscribe' }, { status: 500 })
        }
      }
    }
  }
})
