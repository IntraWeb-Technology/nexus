const portalUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://dashboard.intrawebtech.com'

export function welcomeEmailHtml(params: { name: string }): { subject: string; html: string } {
  return {
    subject: "You're in — your IntraWeb portal is ready",
    html: `
<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;color:#1a1f2e;line-height:1.5">
  <p>Hi ${escapeHtml(params.name)},</p>
  <p>Your <strong>IntraWeb OS Client Portal</strong> is ready. Sign in anytime to track project progress, messages, documents, and billing in one place.</p>
  <p><a href="${portalUrl()}">${portalUrl()}</a></p>
  <p>What happens next: we keep milestones updated here, notify you when something needs your attention, and you can message our team directly from the portal.</p>
  <p>Questions? Reply here or email <a href="mailto:john.schibelli@intrawebtech.com">john.schibelli@intrawebtech.com</a>.</p>
  <p>— IntraWeb Technologies LLC</p>
</body></html>`,
  }
}

export function staffNewMessageHtml(params: {
  clientName: string
  projectSlug: string
  messageBody: string
  portalAdminUrl?: string
}): { subject: string; html: string } {
  const admin = params.portalAdminUrl || portalUrl()
  return {
    subject: `New message from ${params.clientName} — ${params.projectSlug}`,
    html: `
<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;color:#1a1f2e;line-height:1.5">
  <p><strong>${escapeHtml(params.clientName)}</strong> (${escapeHtml(params.projectSlug)}) sent a message in the client portal.</p>
  <blockquote style="border-left:3px solid #3d8b8b;padding-left:12px;margin:12px 0">${escapeHtml(params.messageBody)}</blockquote>
  <p><a href="${admin}">Open portal</a></p>
</body></html>`,
  }
}

export function invoiceReminderHtml(params: {
  description: string
  amountFormatted: string
  dueDate?: string
  paymentUrl?: string
}): { subject: string; html: string } {
  const pay = params.paymentUrl || `${portalUrl()}/billing`
  return {
    subject: `Payment reminder — ${params.description}`,
    html: `
<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;color:#1a1f2e;line-height:1.5">
  <p>This is a friendly reminder about your invoice: <strong>${escapeHtml(params.description)}</strong>.</p>
  <p>Amount due: <strong>${escapeHtml(params.amountFormatted)}</strong>${params.dueDate ? ` — due ${escapeHtml(params.dueDate)}` : ''}.</p>
  <p><a href="${pay}">View billing in the portal</a></p>
</body></html>`,
  }
}

export function milestoneCompleteHtml(params: {
  milestoneTitle: string
  nextMilestone?: string
}): { subject: string; html: string } {
  return {
    subject: `Project update — ${params.milestoneTitle} complete`,
    html: `
<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;color:#1a1f2e;line-height:1.5">
  <p>Good news — <strong>${escapeHtml(params.milestoneTitle)}</strong> is marked complete in your project.</p>
  ${params.nextMilestone ? `<p>Next up: ${escapeHtml(params.nextMilestone)}.</p>` : ''}
  <p><a href="${portalUrl()}">Open your portal</a> for the full timeline and latest updates.</p>
  <p>— IntraWeb Technologies LLC</p>
</body></html>`,
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
