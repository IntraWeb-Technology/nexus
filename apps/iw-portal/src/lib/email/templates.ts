import {
  emailPrimaryCta,
  escapeHtml,
  wrapIntraWebEmailHtml,
  type EmailShellFooter,
  IW_EMAIL,
} from '@/lib/email/design-tokens'

const portalUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://dashboard.intrawebtech.com'

function emailFooter(): EmailShellFooter {
  return {
    companyName: 'IntraWeb Technologies LLC',
    supportEmail: 'john.schibelli@intrawebtech.com',
  }
}

export function welcomeEmailHtml(params: { name: string }): { subject: string; html: string } {
  const body = `<p>Hi ${escapeHtml(params.name)},</p>
  <p>Your <strong>IntraWeb OS Client Portal</strong> is ready. Sign in anytime to track project progress, messages, documents, and billing in one place.</p>
  <p><a href="${escapeHtml(portalUrl())}" style="color:${IW_EMAIL.link};text-decoration:none;font-weight:600;">${escapeHtml(portalUrl())}</a></p>
  <p>What happens next: we keep milestones updated here, notify you when something needs your attention, and you can message our team directly from the portal.</p>
  <p>Questions? Reply here or email <a href="mailto:john.schibelli@intrawebtech.com" style="color:${IW_EMAIL.link};text-decoration:none;">john.schibelli@intrawebtech.com</a>.</p>`
  return {
    subject: "You're in — your IntraWeb portal is ready",
    html: wrapIntraWebEmailHtml(body, emailFooter()),
  }
}

export function staffNewMessageHtml(params: {
  clientName: string
  projectSlug: string
  messageBody: string
  portalAdminUrl?: string
}): { subject: string; html: string } {
  const admin = params.portalAdminUrl || portalUrl()
  const body = `<p><strong>${escapeHtml(params.clientName)}</strong> (${escapeHtml(params.projectSlug)}) sent a message in the client portal.</p>
  <blockquote style="border-left:3px solid ${IW_EMAIL.teal};padding-left:12px;margin:12px 0;color:${IW_EMAIL.muted};">${escapeHtml(params.messageBody)}</blockquote>
  <p><a href="${escapeHtml(admin)}" style="color:${IW_EMAIL.link};text-decoration:none;font-weight:600;">Open portal</a></p>`
  return {
    subject: `New message from ${params.clientName} — ${params.projectSlug}`,
    html: wrapIntraWebEmailHtml(body, emailFooter()),
  }
}

export function invoiceReminderHtml(params: {
  description: string
  amountFormatted: string
  dueDate?: string
  paymentUrl?: string
}): { subject: string; html: string } {
  const pay = params.paymentUrl || `${portalUrl()}/billing`
  const body = `<p>This is a friendly reminder about your invoice: <strong>${escapeHtml(params.description)}</strong>.</p>
  <p>Amount due: <strong>${escapeHtml(params.amountFormatted)}</strong>${params.dueDate ? ` — due ${escapeHtml(params.dueDate)}` : ''}.</p>
  ${emailPrimaryCta(pay, 'View billing in the portal')}`
  return {
    subject: `Payment reminder — ${params.description}`,
    html: wrapIntraWebEmailHtml(body, emailFooter()),
  }
}

export function milestoneCompleteHtml(params: {
  milestoneTitle: string
  nextMilestone?: string
}): { subject: string; html: string } {
  const body = `<p>Good news — <strong>${escapeHtml(params.milestoneTitle)}</strong> is marked complete in your project.</p>
  ${params.nextMilestone ? `<p>Next up: ${escapeHtml(params.nextMilestone)}.</p>` : ''}
  <p><a href="${escapeHtml(portalUrl())}" style="color:${IW_EMAIL.link};text-decoration:none;font-weight:600;">Open your portal</a> for the full timeline and latest updates.</p>`
  return {
    subject: `Project update — ${params.milestoneTitle} complete`,
    html: wrapIntraWebEmailHtml(body, emailFooter()),
  }
}
