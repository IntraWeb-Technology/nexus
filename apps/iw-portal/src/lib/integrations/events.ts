import { createServiceSupabase } from '@/lib/supabase/server'

export type IntegrationProvider = 'clerk' | 'hubspot' | 'stripe' | 'n8n' | 'system'
export type IntegrationEventStatus = 'received' | 'processing' | 'processed' | 'failed' | 'replayed' | 'ignored'

function safePayload(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as Record<string, unknown>
  }
  return { value: payload == null ? null : String(payload) }
}

export async function recordIntegrationEvent(input: {
  provider: IntegrationProvider
  eventType: string
  externalEventId?: string | null
  status?: IntegrationEventStatus
  payload?: unknown
  lastError?: string | null
}) {
  try {
    const supabase = createServiceSupabase()
    await supabase.from('integration_events').insert({
      provider: input.provider,
      event_type: input.eventType,
      external_event_id: input.externalEventId ?? null,
      status: input.status ?? 'received',
      payload: safePayload(input.payload),
      attempts: input.status === 'failed' ? 1 : 0,
      last_error: input.lastError ?? null,
      processed_at: input.status === 'processed' ? new Date().toISOString() : null,
    })
  } catch (e) {
    // Integration logging should never break the source webhook path.
    console.error('[integration-events] record failed', e)
  }
}
