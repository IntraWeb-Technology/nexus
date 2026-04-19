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

/** Build one flat item: CONFIG + email fields (merge can drop the trigger branch; n8n may nest inputs). */
function buildMergedItem() {
  const fromMerge = flattenSubworkflowPayload($input.first()?.json)
  const fromPass = flattenSubworkflowPayload(safeFirstJson('Pass workflow inputs'))
  const fromTrig = flattenSubworkflowPayload(safeFirstJson('Execute Workflow Trigger'))
  // Later sources override earlier for overlapping email keys; CONFIG keys prefer merge (last wins only for email keys from merge)
  const emailKeys = [...EMAIL_KEYS]
  const out = { ...fromTrig, ...fromPass, ...fromMerge }
  for (const k of emailKeys) {
    const v =
      fromMerge[k] !== undefined && fromMerge[k] !== null && fromMerge[k] !== ''
        ? fromMerge[k]
        : fromPass[k] !== undefined && fromPass[k] !== null && fromPass[k] !== ''
          ? fromPass[k]
          : fromTrig[k]
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
  // Served from apps/iw-site/public/branding/ (deploy iw-site so this URL returns 200).
  const DEFAULT_LOGO = 'https://www.intrawebtech.com/branding/intraweb-logo-light.png'
  let logoUrl = String(config.branding?.logoUrl || '').trim()
  if (!logoUrl || logoUrl.includes('intraweb-logo-black')) {
    logoUrl = DEFAULT_LOGO
  } else if (
    logoUrl.includes('intrawebtech.com') &&
    logoUrl.includes('/intraweb-logo-light.png') &&
    !logoUrl.includes('/branding/')
  ) {
    // Legacy root URL → same file under /branding/
    logoUrl = DEFAULT_LOGO
  }
  const company = escapeHtml(owner.companyName || 'IntraWeb Technologies LLC')
  const supportEmail = String(owner.email || '').trim()
  const calendarLink = String(owner.calendarLink || '').trim()

  const tagline = `<p style="margin:14px 0 0;font-family:Montserrat,Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${E.teal};">Systems &amp; automation for growing teams</p>`

  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" width="280" alt="${company}" style="display:block;max-width:280px;width:100%;height:auto;border:0;" />${tagline}`
    : `<div style="font-family:Montserrat,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:${E.text};letter-spacing:-0.02em;">IntraWeb</div>${tagline}`

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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:${E.bg};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${E.bg};padding:32px 16px;">
  <tr><td align="center">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${E.card};border-radius:1