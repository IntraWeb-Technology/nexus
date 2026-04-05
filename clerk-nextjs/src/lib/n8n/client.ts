import type {
  DocumentRequestPayload,
  InvoicePaidPayload,
  LoginEventPayload,
  StaffAlertPayload,
} from '@/lib/n8n/webhooks'

function baseUrl(): string {
  return process.env.N8N_BASE_URL?.replace(/\/$/, '') || 'https://n8n.intrawebtech.com'
}

function secretHeaders(): HeadersInit {
  const s = process.env.WEBHOOK_SECRET
  if (!s) return {}
  return { 'x-intrawebtech-secret': s, 'content-type': 'application/json' }
}

function fireAndForget(url: string, body: unknown) {
  fetch(url, {
    method: 'POST',
    headers: secretHeaders(),
    body: JSON.stringify(body),
  }).catch((e) => console.error('[n8n]', url, e))
}

export function triggerStaffAlert(payload: StaffAlertPayload): void {
  try {
    fireAndForget(`${baseUrl()}/webhook/portal-message-received`, payload)
  } catch (e) {
    console.error('[n8n] triggerStaffAlert', e)
  }
}

export function triggerLoginEvent(payload: LoginEventPayload): void {
  try {
    fireAndForget(`${baseUrl()}/webhook/portal-login`, payload)
  } catch (e) {
    console.error('[n8n] triggerLoginEvent', e)
  }
}

export function triggerDocumentRequest(payload: DocumentRequestPayload): void {
  try {
    fireAndForget(`${baseUrl()}/webhook/portal-document-request`, payload)
  } catch (e) {
    console.error('[n8n] triggerDocumentRequest', e)
  }
}

export function triggerInvoicePaid(payload: InvoicePaidPayload): void {
  try {
    fireAndForget(`${baseUrl()}/webhook/portal-invoice-paid`, payload)
  } catch (e) {
    console.error('[n8n] triggerInvoicePaid', e)
  }
}
