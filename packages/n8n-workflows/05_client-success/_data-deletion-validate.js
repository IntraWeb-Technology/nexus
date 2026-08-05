const root = $('Data Deletion Webhook').first().json
const headers = root.headers || {}
const body = root.body || root

const config = $('Get Config').first().json
const secret = String(config.secrets?.webhookSecret || '').trim()

function fail(message) {
  return [{ json: { valid: false, message } }]
}

const headerSecret =
  headers['x-intrawebtech-secret'] ||
  headers['X-Intrawebtech-Secret'] ||
  headers['x-intrawebtech-secret'.toLowerCase()]

if (!secret) return fail('Webhook secret not configured.')
if (!headerSecret || String(headerSecret).trim() !== secret) {
  return fail('Unauthorized.')
}

const requestId = String(body.request_id || body.requestId || '').trim()
const email = String(body.email || '').trim().toLowerCase()

if (!requestId || !email.includes('@')) {
  return fail('request_id and email are required.')
}

return [{ json: { valid: true, request_id: requestId, email } }]
