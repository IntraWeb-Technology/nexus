const E = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f1419',
  muted: '#475569',
  teal: '#0d9488',
  link: '#0d9488',
  footerBg: '#fafbfc',
}

const LOGO = 'https://www.intrawebtech.com/IW-logo-q2.png'
const COMPANY = 'IntraWeb Technologies LLC'
const SUPPORT = 'john.schibelli@intrawebtech.com'

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const valid = $('Validate Unsubscribe Link').first().json.valid === true
const email = $('Validate Unsubscribe Link').first().json.email || ''
const message = $('Validate Unsubscribe Link').first().json.message || 'We could not process this request.'

let hubspot = {}
try {
  hubspot = $('Extract Contact').first().json || {}
} catch {
  hubspot = {}
}

const contactFound = Boolean(hubspot.contactId)

let title = 'Unsubscribe request'
let body = message
let tone = 'neutral'

if (valid && contactFound) {
  title = 'You are unsubscribed'
  body = `${escapeHtml(email)} will no longer receive marketing or reactivation emails from IntraWeb.`
  tone = 'success'
} else if (valid && !contactFound) {
  title = 'Request received'
  body = `We recorded your unsubscribe request for ${escapeHtml(email)}.`
  tone = 'success'
} else {
  tone = 'error'
}

const icon =
  tone === 'success'
    ? `<div style="width:48px;height:48px;border-radius:999px;background:#ecfdf5;border:1px solid #99f6e4;display:flex;align-items:center;justify-content:center;margin:0 0 16px;font-size:24px;line-height:1;color:${E.teal};">✓</div>`
    : `<div style="width:48px;height:48px;border-radius:999px;background:#fef2f2;border:1px solid #fecaca;display:flex;align-items:center;justify-content:center;margin:0 0 16px;font-size:24px;line-height:1;color:#dc2626;">!</div>`

const tagline = `<p style="margin:14px 0 0;font-family:Montserrat,Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${E.teal};">Systems &amp; automation for growing teams</p>`

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<title>${escapeHtml(title)} — ${escapeHtml(COMPANY)}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&amp;family=Roboto:wght@400;500;700&amp;display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:${E.bg};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${E.bg};padding:32px 16px;min-height:100vh;">
  <tr><td align="center" style="padding:24px 0;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${E.card};border-radius:12px;border:1px solid ${E.border};overflow:hidden;box-shadow:0 1px 3px rgba(15,20,25,0.06);">
    <tr><td style="padding:0;height:4px;background:${E.teal};font-size:0;line-height:4px;">&nbsp;</td></tr>
    <tr><td style="padding:28px 24px 12px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;text-align:left;">
      <img src="${LOGO}" width="220" alt="${escapeHtml(COMPANY)}" style="display:block;max-width:220px;width:100%;height:auto;border:0;margin:0;" />
      ${tagline}
    </td></tr>
    <tr><td style="padding:8px 24px 32px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${E.text};">
      ${icon}
      <h1 style="margin:0 0 12px;font-family:Montserrat,Segoe UI,Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;line-height:1.25;color:${E.text};letter-spacing:-0.02em;">${escapeHtml(title)}</h1>
      <p style="margin:0 0 16px;color:${E.muted};">${body}</p>
      ${
        tone === 'success'
          ? `<p style="margin:0;font-size:13px;color:${E.muted};">You can close this window. No further action is needed.</p>`
          : `<p style="margin:0;font-size:13px;color:${E.muted};">If you believe this is an error, email <a href="mailto:${escapeHtml(SUPPORT)}" style="color:${E.link};text-decoration:none;">${escapeHtml(SUPPORT)}</a>.</p>`
      }
    </td></tr>
    <tr><td style="padding:20px 24px 28px;border-top:1px solid ${E.border};background:${E.footerBg};font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:${E.muted};">
      <p style="margin:0 0 8px;">${escapeHtml(COMPANY)}</p>
      <p style="margin:0;"><a href="mailto:${escapeHtml(SUPPORT)}" style="color:${E.link};text-decoration:none;">${escapeHtml(SUPPORT)}</a> · <a href="https://cal.com/intraweb/discovery?overlayCalendar=true" style="color:${E.link};text-decoration:none;">Schedule time</a> · <a href="https://www.intrawebtech.com" style="color:${E.link};text-decoration:none;">intrawebtech.com</a></p>
    </td></tr>
  </table>
  </td></tr>
</table>
</body>
</html>`

return [{ json: { html } }]
