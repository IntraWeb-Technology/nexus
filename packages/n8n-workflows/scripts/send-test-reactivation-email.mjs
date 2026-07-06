/**
 * One-off branded test send via Resend (bypasses n8n opt-out filters).
 * Usage: node packages/n8n-workflows/scripts/send-test-reactivation-email.mjs [email]
 */
import crypto from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { loadEnvLocal, REPO_ROOT } from './lib/n8n-env.mjs'

loadEnvLocal()
const portalEnv = join(REPO_ROOT, '.env.iw-portal.local')
if (existsSync(portalEnv)) {
  const text = readFileSync(portalEnv, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

const email = (process.argv[2] || 'jschibelli@gmail.com').trim().toLowerCase()
const secret =
  process.env.WEBHOOK_SECRET || 'n8n.intrawebtech.com/webhook/hubspot-events'
const base = (process.env.N8N_BASE_URL || 'https://n8n.intrawebtech.com').replace(
  /\/$/,
  '',
)
const resendKey = process.env.RESEND_API_KEY

if (!resendKey) {
  console.error('Missing RESEND_API_KEY')
  process.exit(1)
}

const sig = crypto.createHmac('sha256', secret).update(email).digest('hex').slice(0, 32)
const unsub = `${base}/webhook/email-unsubscribe?email=${encodeURIComponent(email)}&sig=${sig}`

const inner = `<p>Hi John,</p>
<p>This is a <strong>test reactivation email</strong> so you can verify branding and the unsubscribe link.</p>
<p>The earlier live test only opened the unsubscribe webhook in a browser — it did <em>not</em> send an email.</p>
<p><a href="https://cal.com/intraweb/discovery?overlayCalendar=true" style="color:#0d9488;text-decoration:none;font-weight:600;">Book a 15-minute catch-up</a></p>
<p>— John<br/>IntraWeb Technologies LLC</p>`

const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
<tr><td style="padding:0;height:4px;background:#0d9488;">&nbsp;</td></tr>
<tr><td style="padding:28px 20px 12px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;">
<img src="https://www.intrawebtech.com/IW-logo-q2.png" width="280" alt="IntraWeb Technologies LLC" style="display:block;max-width:280px;width:100%;height:auto;border:0;" />
</td></tr>
<tr><td style="padding:8px 20px 40px;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#0f1419;">${inner}</td></tr>
<tr><td style="padding:20px 20px 28px;border-top:1px solid #e2e8f0;background:#fafbfc;font-family:Roboto,Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#475569;">
<p style="margin:0 0 8px;">IntraWeb Technologies LLC</p>
<p style="margin:0;"><a href="mailto:john.schibelli@intrawebtech.com" style="color:#0d9488;text-decoration:none;">john.schibelli@intrawebtech.com</a> · <a href="https://cal.com/intraweb/discovery?overlayCalendar=true" style="color:#0d9488;text-decoration:none;">Schedule time</a> · <a href="${unsub}" style="color:#0d9488;text-decoration:none;">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${resendKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'John Schibelli| IntraWeb Technologies <john.schibelli@intrawebtech.com>',
    to: [email],
    subject: 'TEST — Checking in — IntraWeb (unsubscribe link)',
    html,
    headers: {
      'List-Unsubscribe': `<${unsub}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }),
})

const body = await res.text()
console.log('to:', email)
console.log('Resend', res.status, body)
if (!res.ok) process.exit(1)
