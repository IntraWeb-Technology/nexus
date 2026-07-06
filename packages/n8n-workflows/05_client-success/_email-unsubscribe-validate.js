const root = $('Email Unsubscribe Webhook').first().json
const query = root.query || root.params || {}
const email = String(query.email || '').trim().toLowerCase()
const sig = String(query.sig || '').trim()
const config = $('Get Config').first().json
const secret = String(config.secrets?.webhookSecret || '').trim()

function fail(message) {
  return [{ json: { valid: false, message, email } }]
}

if (!email || !email.includes('@')) return fail('Invalid email address.')
if (!secret) return fail('Unsubscribe is not configured.')

const expected = hmacSha256Hex(email, secret, 32)
if (!sig || sig !== expected) return fail('Invalid or expired unsubscribe link.')

return [{ json: { valid: true, email } }]
