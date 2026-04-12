import { Resend } from 'resend'
import { staffNewMessageHtml, welcomeEmailHtml } from '@/lib/email/templates'

function resend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

export async function sendWelcomeEmail(to: string, name: string) {
  const { subject, html } = welcomeEmailHtml({ name })
  await resend().emails.send({
    from: 'john@intrawebtech.com',
    to,
    subject,
    html,
  })
}

export async function sendStaffNewMessageAlert(params: {
  clientName: string
  projectSlug: string
  messageBody: string
}) {
  const staff = process.env.STAFF_EMAIL || 'john.schibelli@intrawebtech.com'
  const { subject, html } = staffNewMessageHtml({
    clientName: params.clientName,
    projectSlug: params.projectSlug,
    messageBody: params.messageBody,
  })
  await resend().emails.send({
    from: 'noreply@intrawebtech.com',
    to: staff,
    subject,
    html,
  })
}
