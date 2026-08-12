import { editorialCategoryLabel, portalReviewUrl } from '@/lib/social-ops/types'
import type { OutboxEventRow } from '@/lib/social-ops/types'

function riskLabel(level: unknown): string {
  if (typeof level !== 'string') return 'Medium'
  return level.charAt(0).toUpperCase() + level.slice(1)
}

function formatPlatforms(platforms: unknown): string {
  if (!Array.isArray(platforms)) return 'Unknown'
  return platforms
    .map((p) => (typeof p === 'string' ? p.charAt(0).toUpperCase() + p.slice(1) : String(p)))
    .join(', ')
}

export function buildReviewCreatedChatMessage(event: OutboxEventRow): string {
  const p = event.payload
  const category = editorialCategoryLabel(String(p.editorial_category ?? 'unknown'))
  const headline = String(p.headline ?? '(no headline)')
  const platforms = formatPlatforms(p.platforms)
  const risk = riskLabel(p.risk_level)
  const reviewUrl = typeof p.review_url === 'string' ? p.review_url : portalReviewUrl()

  return [
    'Daily social draft ready',
    '',
    `Category: ${category}`,
    `Headline: ${headline}`,
    `Platforms: ${platforms}`,
    `Risk: ${risk}`,
    'Status: Pending review',
    '',
    `Review in IW Portal: ${reviewUrl}`,
  ].join('\n')
}

export function buildReviewCompletedChatMessage(event: OutboxEventRow): string {
  const p = event.payload
  const action = String(p.action ?? 'unknown').replace(/_/g, ' ')
  const reviewId = String(p.review_item_id ?? '')
  return [
    'Social review completed',
    '',
    `Action: ${action}`,
    `Review item: ${reviewId}`,
    `Portal: ${portalReviewUrl(reviewId)}`,
  ].join('\n')
}

export async function sendGoogleChatMessage(message: string, priority: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL?.trim()
  if (webhookUrl) {
    const emoji = priority === 'error' ? '🚨' : priority === 'warning' ? '⚠️' : 'ℹ️'
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `${emoji} ${message}` }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      throw new Error(`Google Chat webhook HTTP ${response.status}`)
    }
    return
  }

  const n8nBase = process.env.N8N_BASE_URL?.replace(/\/$/, '') || 'https://n8n.intrawebtech.com'
  const secret = process.env.WEBHOOK_SECRET
  const response = await fetch(`${n8nBase}/webhook/portal-google-chat-alert`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(secret ? { 'x-intrawebtech-secret': secret } : {}),
    },
    body: JSON.stringify({ message, priority }),
    signal: AbortSignal.timeout(12_000),
  })

  if (!response.ok) {
    throw new Error(
      'Google Chat delivery failed: set GOOGLE_CHAT_WEBHOOK_URL or configure n8n webhook portal-google-chat-alert',
    )
  }
}

export async function handleOutboxEvent(event: OutboxEventRow): Promise<void> {
  switch (event.event_type) {
    case 'social.review.created':
      await sendGoogleChatMessage(buildReviewCreatedChatMessage(event), 'info')
      return
    case 'social.review.completed':
      await sendGoogleChatMessage(buildReviewCompletedChatMessage(event), 'info')
      return
    case 'social.workflow.failed':
      await sendGoogleChatMessage(String(event.payload.message ?? 'Social workflow failed'), 'error')
      return
    default:
      throw new Error(`Unsupported outbox event type: ${event.event_type}`)
  }
}
