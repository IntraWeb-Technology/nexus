/**
 * IntraWeb transactional email design tokens (email-client safe: inlined hex only).
 * Aligned with apps/iw-portal/src/app/globals.css light theme and marketing charcoal/teal.
 *
 * Compliance (audits):
 * - Full: uses wrapIntraWebEmailHtml; body uses these tokens; logo when URL set.
 * - Partial: correct colors in fragment but no shared shell.
 * - Non-branded: bare fragments, ad-hoc colors, or CSS variables in client HTML.
 */
export const IW_EMAIL = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f1419',
  muted: '#475569',
  teal: '#0d9488',
  tealLight: '#14b8a6',
  link: '#0d9488',
} as const

/** Public logo used in HTML img src; override with EMAIL_LOGO_URL / NEXT_PUBLIC_EMAIL_LOGO_URL. */
export const DEFAULT_EMAIL_LOGO_URL =
  'https://www.intrawebtech.com/branding/intraweb-logo-light.png'

export function emailLogoUrl(): string {
  return (
    process.env.EMAIL_LOGO_URL ||
    process.env.NEXT_PUBLIC_EMAIL_LOGO_URL ||
    DEFAULT_EMAIL_LOGO_URL
  ).trim()
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export type EmailShellFooter = {
  companyName: string
  supportEmail?: string
  calendarUrl?: string
}

/**
 * Wraps inner body HTML (fragment only — no html/head/body) in the shared IntraWeb shell.
 * Set opts.skipShell to send raw HTML (e.g. pre-built messages).
 */
export function wrapIntraWebEmailHtml(
  innerBodyHtml: string,
  footer: EmailShellFooter,
  opts?: { skipShell?: boolean; logoUrl?: string },
): string {
  const body = innerBodyHtml.trim()
  if (opts?.skipShell) return body

  let logoUrl = (opts?.logoUrl ?? emailLogoUrl()).trim()
  if (!logoUrl || logoUrl.includes('intraweb-logo-black')) {
    logoUrl = DEFAULT_EMAIL_LOGO_URL
  } else if (
    logoUrl.includes('intrawebtech.com') &&
    logoUrl.includes('/intraweb-logo-light.png') &&
    !logoUrl.includes('/branding/')
  ) {
    logoUrl = DEFAULT_EMAIL_LOGO_URL
  }
  const company = escapeHtml(footer.companyName)
  const support = footer.supportEmail?.trim()
  const cal = footer.calendarUrl?.trim()

  const tagline = `<p style="margin:14px 0 0;font-family:Montserrat,Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${IW_EMAIL.teal};">Systems &amp; automation for growing teams</p>`

  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" width="280" alt="${company}" style="display:block;max-width:280px;width:100%;height:auto;border:0;" />${tagline}`
    : `<div style="font-family:Montserrat,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:${IW_EMAIL.text};letter-spacing:-0.02em;">IntraWeb</div>${tagline}`

  const footerLine2 = [
    support
      ? `<a href="mailto:${escapeHtml(support)}" style="color:${IW_EMAIL.link};text-decoration:none;">${escapeHtml(support)}</a>`
      : '',
    cal
      ? `<a href="${escapeHtml(cal)}" style="color:${IW_EMAIL.link};text-decoration:none;">Schedule time</a>`
      : '',
  ]
    .filter(Boolean)
    .join(' · ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&amp;family=Roboto:wght@400;500;700&amp;display=swap" rel="stylesheet" />
<title>${company}</title>
</head>
<body style="margin:0;padding:0;background:${IW_EMAIL.bg};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${IW_EMAIL.bg};padding:32px 16px;">
  <tr><td align="center">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${IW_EMAIL.card};border-radius:12px;border:1px solid ${IW_EMAIL.border};overflow:hidden;" data-iw-email-shell="1">
    <tr><td style="padding:0;height:4px;background:${IW_EMAIL.teal};font-size:0;line-height:4px;">&nbsp;</td></tr>
    <tr><td style="padding:28px 32px 12px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;">
      ${logoBlock}
    </td></tr>
    <tr><td style="padding:8px 32px 40px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${IW_EMAIL.text};">
      <div style="min-height:72px;">${body}</div>
    </td></tr>
    <tr><td style="padding:20px 32px 28px;border-top:1px solid ${IW_EMAIL.border};background:#fafbfc;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:${IW_EMAIL.muted};">
      <p style="margin:0 0 8px;">${company}</p>
      ${footerLine2 ? `<p style="margin:0;">${footerLine2}</p>` : ''}
    </td></tr>
  </table>
  </td></tr>
</table>
</body>
</html>`
}

/** Primary CTA button (table-based for Outlook). */
export function emailPrimaryCta(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:16px 0;"><tr><td style="border-radius:8px;background:${IW_EMAIL.teal};">
<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
</td></tr></table>`
}
