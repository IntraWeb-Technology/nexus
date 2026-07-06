import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { REPO_ROOT } from './lib/n8n-env.mjs'

const id = process.argv[2]
if (!id) {
  console.error('Usage: node check-resend-email.mjs <resend-email-id>')
  process.exit(1)
}

const env = readFileSync(join(REPO_ROOT, '.env.iw-portal.local'), 'utf8')
const m = env.match(/RESEND_API_KEY="([^"]+)"/)
if (!m) {
  console.error('RESEND_API_KEY not found')
  process.exit(1)
}

const res = await fetch(`https://api.resend.com/emails/${id}`, {
  headers: { Authorization: `Bearer ${m[1]}` },
})
console.log(res.status, await res.text())
