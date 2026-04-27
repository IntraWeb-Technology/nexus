/**
 * Staff / internal HTML email shell for iw-site (hex values match portal `design-tokens.ts`).
 */

const IW = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f1419',
  muted: '#475569',
  teal: '#0d9488',
  link: '#0d9488',
} as const

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function siteBase(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.intrawebtech.com'
}

function logoUrlLight(): string {
  const fromEnv = process.env.EMAIL_LOGO_URL?.trim()
  if (fromEnv) return fromEnv
  return `${siteBase()}/IW-logo-q2.png`
}

function logoUrlDark(): string {
  const fromEnv = process.env.EMAIL_LOGO_DARK_URL?.trim()
  if (fromEnv) return fromEnv
  return `${siteBase()}/IW-logo-q2.png`
}

/** Wraps a body fragment for staff notifications (IntraWeb header + footer). */
export function wrapIntraWebStaffEmailHtml(innerBodyHtml: string): string {
  const company = 'IntraWeb Technologies LLC'
  let logo = logoUrlLight()
  if (!logo || (logo.includes('intraweb-logo-black') && !logo.includes('inverted'))) {
    logo = `${siteBase()}/IW-logo-q2.png`
  }
  const logoDark = logoUrlDark()
  const imgStyle =
    'display:block;max-width:280px;width:100%;height:auto;border:0;margin:0;'
  const tagline = `<p class="iw-email-tagline" style="margin:14px 0 0;font-family:Montserrat,Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${IW.teal};">Systems &amp; automation for growing teams</p>`
  const logoBlock =
    `<div class="iw-email-logo">` +
    `<img class="iw-email-logo-light" src="${escapeHtml(logo)}" width="280" alt="${escapeHtml(company)}" style="${imgStyle}" />` +
    `<img class="iw-email-logo-dark" src="${escapeHtml(logoDark)}" width="280" alt="${escapeHtml(company)}" style="${imgStyle}" />` +
    `</div>${tagline}`

  const headStyles = `<style type="text/css">
.iw-email-body table { width:100% !important; max-width:100%; border-collapse:collapse; }
.iw-email-body img { max-width:100%; height:auto; }
.iw-email-logo-light { display:block !important; }
.iw-email-logo-dark { display:none !important; }
@media (prefers-color-scheme: dark) {
  .iw-email-logo-light { display:none !important; }
  .iw-email-logo-dark { display:block !important; }
  .iw-email-tagline { color:#5eead4 !important; }
}
</style>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&amp;family=Roboto:wght@400;500;700&amp;display=swap" rel="stylesheet" />
${headStyles}
</head>
<body style="margin:0;padding:0;background:${IW.bg};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${IW.bg};padding:32px 0;">
  <tr><td align="center">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${IW.card};border-radius:12px;border:1px solid ${IW.border};overflow:hidden;" data-iw-email-shell="1">
    <tr><td style="padding:0;height:4px;background:${IW.teal};font-size:0;line-height:4px;">&nbsp;</td></tr>
    <tr><td style="padding:28px 20px 12px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;">
      ${logoBlock}
    </td></tr>
    <tr><td style="padding:8px 20px 40px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${IW.text};">
      <div class="iw-email-body" style="min-height:72px;">${innerBodyHtml}</div>
    </td></tr>
    <tr><td style="padding:20px 20px 28px;border-top:1px solid ${IW.border};background:#fafbfc;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:${IW.muted};">
      <p style="margin:0;">${escapeHtml(company)}</p>
    </td></tr>
  </table>
  </td></tr>
</table>
</body>
</html>`
}
