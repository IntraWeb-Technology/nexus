import type {
  ChangeOrderRequestedPayload,
  DocumentRequestPayload,
  DocumentSignedPayload,
  InvoicePaidPayload,
  LoginEventPayload,
  MilestoneApprovedPayload,
  StaffAlertPayload,
  StripeCatalogCheckoutPayload,
} from '@/lib/n8n/webhooks'

function baseUrl(): string {
  return process.env.N8N_BASE_URL?.replace(/\/$/, '') || 'https://n8n.intrawebtech.com'
}

function secretHeaders(): HeadersInit {
  const s = process.env.WEBHOOK_SECRET
  if (!s) return { 'content-type': 'application/json' }
  return { 'x-intrawebtech-secret': s, 'content-type': 'application/json' }
}

const DEFAULT_TIMEOUT_MS = 8000
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504])

async function postWebhook(url: string, body: unknown, retries = 0): Promise<void> {
  let lastError: unknown = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: secretHeaders(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      })
      if (response.ok) return
      if (!RETRYABLE_STATUSES.has(response.status) || attempt >= retries) {
        throw new Error(`HTTP ${response.status}`)
      }
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
      if (attempt >= retries) {
        throw error
      }
    }
  }
  throw lastError ?? new Error('Webhook dispatch failed')
}

function fireAndForget(url: string, body: unknown) {
  postWebhook(url, body).catch((e) => console.error('[n8n]', url, e))
}

async function dispatchCritical(eventName: string, path: string, body: unknown): Promise<void> {
  try {
    await postWebhook(`${baseUrl()}${path}`, body, 1)
  } catch (error) {
    console.error(`[n8n] ${eventName}`, error)
  }
}

export function triggerStaffAlert(payload: StaffAlertPayload): void {
  try {
    fireAndForget(`${baseUrl()}/webhook/portal-message-received`, payload)
  } catch (e) {
    console.error('[n8n] triggerStaffAlert', e)
  }
}

export async function triggerLoginEvent(payload: LoginEventPayload): Promise<void> {
  await dispatchCritical('triggerLoginEvent', '/webhook/portal-login', payload)
}

export function triggerDocumentRequest(payload: DocumentRequestPayload): void {
  try {
    fireAndForget(`${baseUrl()}/webhook/portal-document-request`, payload)
  } catch (e) {
    console.error('[n8n] triggerDocumentRequest', e)
  }
}

export async function triggerInvoicePaid(payload: InvoicePaidPayload): Promise<void> {
  await dispatchCritical('triggerInvoicePaid', '/webhook/portal-invoice-paid', payload)
}

/** Catalog Payment Link (or subscription link) checkout → n8n → HubSpot. */
export async function triggerStripeCatalogCheckout(payload: StripeCatalogCheckoutPayload): Promise<void> {
  await dispatchCritical('triggerStripeCatalogCheckout', '/webhook/portal-stripe-catalog-payment', payload)
}

export function triggerDocumentSigned(payload: DocumentSignedPayload): void {
  try {
    fireAndForget(`${baseUrl()}/webhook/portal-document-signed`, payload)
  } catch (e) {
    console.error('[n8n] triggerDocumentSigned', e)
  }
}

export function triggerMilestoneApproved(payload: MilestoneApprovedPayload): void {
  try {
    fireAndForget(`${baseUrl()}/webhook/portal-milestone-approved`, payload)
  } catch (e) {
    console.error('[n8n] triggerMilestoneApproved', e)
  }
}

export function triggerChangeOrderRequested(payload: ChangeOrderRequestedPayload): void {
  try {
    fireAndForget(`${baseUrl()}/webhook/portal-change-order`, payload)
  } catch (e) {
    console.error('[n8n] triggerChangeOrderRequested', e)
  }
}
