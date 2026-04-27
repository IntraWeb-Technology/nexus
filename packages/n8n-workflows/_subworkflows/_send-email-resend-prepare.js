/**
 * n8n Code node: SW — Send Email via Resend → "Prepare Email"
 * Input is **Merge trigger and config** output: flat merge of workflow inputs + CONFIG (n8n 2.14+
 * task runner: avoid $('…') to other nodes — use $input only).
 * Keep hex values in sync with apps/iw-portal/src/lib/email/design-tokens.ts
 */
const EMAIL_KEYS = new Set([
  'to',
  'subject',
  'html',
  'attachments',
  'skipBranding',
  'workflowName',
])

function flattenSubworkflowPayload(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {}
  const out = { ...obj }
  const wi = out.workflowInputs
  if (wi && typeof wi === 'object' && !Array.isArray(wi)) {
    Object.assign(out, wi)
    delete out.workflowInputs
  }
  return out
}

function safeFirstJson(nodeName) {
  try {
    return $(nodeName).first()?.json
  } catch {
    return null
  }
}

/** CONFIG from merge + email fields (merge can be CONFIG-only; n8n may nest inputs under workflowInputs). */
function buildMergedItem() {
  const fromMerge = flattenSubworkflowPayload($input.first()?.json)
  const fromPass = flattenSubworkflowPayload(safeFirstJson('Pass workflow inputs'))
  const fromTrig = flattenSubworkflowPayload(safeFirstJson('Execute Workflow Trigger'))
  const out = { ...fromMerge }
  for (const k of EMAIL_KEYS) {
    const v = fromMerge[k] ?? fromPass[k] ?? fromTrig[k]
    if (v !== undefined) out[k] = v
  }
  return out
}

const m = buildMergedItem()

const input = {}
const config = {}
for (const [k, v] of Object.entries(m)) {
  if (EMAIL_KEYS.has(k)) input[k] = v
  else config[k] = v
}

if (!input.to) {
  const keys =
    input && typeof input === 'object' ? Object.keys(input).join(', ') : String(input)
  throw new Error(
    'Missing required field "to". In the **parent** workflow, open the Execute Sub-workflow node → **Workflow Inputs** and map `to`, `subject`, and `html` (expressions or fixed values). n8n does not pass the previous node\'s fields automatically. Expected { to, subject, html }. Merged keys: ' +
      Object.keys(m).join(', ') +
      ' (email fields picked: ' +
      keys +
      ')',
  )
}
if (!input.subject) {
  throw new Error('Missing required field "subject". The calling workflow must pass { to, subject, html }.')
}
if (!input.html) {
  throw new Error('Missing required field "html". The calling workflow must pass { to, subject, html }.')
}
if (!config.owner) {
  throw new Error(
    'Missing CONFIG on merged item (no owner). Ensure Get CONFIG ran and Merge combines trigger + CONFIG outputs.',
  )
}

const from = `${config.owner.fromName} <${config.owner.fromEmail}>`

const E = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f1419',
  muted: '#475569',
  teal: '#0d9488',
  link: '#0d9488',
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrapEmail(innerHtml) {
  const owner = config.owner || {}
  // Served from apps/iw-site-q2/public (www.intrawebtech.com root).
  const DEFAULT_LOGO = 'https://www.intrawebtech.com/IW-logo-q2.png'
  const DEFAULT_LOGO_DARK = 'https://www.intrawebtech.com/IW-logo-q2.png'
  let logoUrl = String(config.branding?.logoUrl || '').trim()
  if (!logoUrl || (logoUrl.includes('intraweb-logo-black') && !logoUrl.includes('inverted'))) {
    logoUrl = DEFAULT_LOGO
  } else if (
    logoUrl.includes('intrawebtech.com') &&
    logoUrl.includes('/intraweb-logo-light.png') &&
    !logoUrl.includes('/branding/')
  ) {
    logoUrl = DEFAULT_LOGO
  }
  let logoUrlDark = String(config.branding?.logoUrlDark || '').trim()
  if (!logoUrlDark) {
    logoUrlDark = DEFAULT_LOGO_DARK
  }
  const company = escapeHtml(owner.companyName || 'IntraWeb Technologies LLC')
  const supportEmail = String(owner.email || '').trim()
  const calendarLink = String(owner.calendarLink || '').trim()

  const imgStyle =
    'display:block;max-width:280px;width:100%;height:auto;border:0;margin:0;'
  const tagline = `<p class="iw-email-tagline" style="margin:14px 0 0;font-family:Montserrat,Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${E.teal};">Systems &amp; automation for growing teams</p>`

  let logoBlock
  if (logoUrl) {
    logoBlock =
      `<div class="iw-email-logo">` +
      `<img class="iw-email-logo-light" src="${escapeHtml(logoUrl)}" width="280" alt="${company}" style="${imgStyle}" />` +
      `<img class="iw-email-logo-dark" src="${escapeHtml(logoUrlDark)}" width="280" alt="${company}" style="${imgStyle}" />` +
      `</div>${tagline}`
  } else {
    logoBlock = `<div class="iw-email-logo iw-email-wordmark" style="font-family:Montserrat,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:${E.text};letter-spacing:-0.02em;">IntraWeb</div>${tagline}`
  }

  const footerBits = []
  if (supportEmail) {
    const e = escapeHtml(supportEmail)
    footerBits.push(
      `<a href="mailto:${e}" style="color:${E.link};text-decoration:none;">${e}</a>`,
    )
  }
  if (calendarLink) {
    footerBits.push(
      `<a href="${escapeHtml(calendarLink)}" style="color:${E.link};text-decoration:none;">Schedule time</a>`,
    )
  }
  const footerLine2 = footerBits.length ? `<p style="margin:0;">${footerBits.join(' · ')}</p>` : ''

  const headStyles = `<style type="text/css">
.iw-email-body table { width:100% !important; max-width:100%; border-collapse:collapse; }
.iw-email-body img { max-width:100%; height:auto; }
.iw-email-logo-light { display:block !important; }
.iw-email-logo-dark { display:none !important; }
@media (prefers-color-scheme: dark) {
  .iw-email-logo-light { display:none !important; }
  .iw-email-logo-dark { display:block !important; }
  .iw-email-tagline { color:#5eead4 !important; }
  .iw-email-wordmark { color:#f8fafc !important; }
}
</style>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
${headStyles}
</head>
<body style="margin:0;padding:0;background:${E.bg};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${E.bg};padding:32px 0;">
  <tr><td align="center">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${E.card};border-radius:12px;border:1px solid ${E.border};overflow:hidden;" data-iw-email-shell="1">
    <tr><td style="padding:0;height:4px;background:${E.teal};font-size:0;line-height:4px;">&nbsp;</td></tr>
    <tr><td style="padding:28px 20px 12px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;">
      ${logoBlock}
    </td></tr>
    <tr><td style="padding:8px 20px 40px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${E.text};">
      <div class="iw-email-body" style="min-height:72px;">${innerHtml}</div>
    </td></tr>
    <tr><td style="padding:20px 20px 28px;border-top:1px solid ${E.border};background:#fafbfc;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:${E.muted};">
      <p style="margin:0 0 8px;">${company}</p>
      ${footerLine2}
    </td></tr>
  </table>
  </td></tr>
</table>
</body>
</html>`
}

const rawHtml = String(input.html || '').trim()
const skip =
  input.skipBranding === true ||
  rawHtml.includes('data-iw-email-shell="1"') ||
  /^<(!DOCTYPE|html)\b/i.test(rawHtml)

const finalHtml = skip ? String(input.html) : wrapEmail(String(input.html))

const payload = {
  from,
  to: [input.to],
  subject: input.subject,
  html: finalHtml,
}

if (input.attachments) {
  payload.attachments = input.attachments
}

return [
  {
    json: {
      payload,
      workflowName: input.workflowName || 'SW: Send Email via Resend',
      to: input.to,
    },
  },
]
