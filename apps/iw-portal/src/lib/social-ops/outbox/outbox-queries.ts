import type { SupabaseClient } from '@supabase/supabase-js'
import type { OutboxEventRow } from '@/lib/social-ops/types'

export const OUTBOX_MAX_ATTEMPTS = 5
export const OUTBOX_BATCH_SIZE = 20

export async function fetchDueOutboxEvents(
  supabase: SupabaseClient,
  limit = OUTBOX_BATCH_SIZE,
): Promise<OutboxEventRow[]> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('outbox_event')
    .select('*')
    .eq('status', 'pending')
    .lte('available_at', now)
    .order('available_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as OutboxEventRow[]
}

export async function markOutboxPublished(
  supabase: SupabaseClient,
  eventId: string,
): Promise<void> {
  const { error } = await supabase
    .from('outbox_event')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)

  if (error) throw error
}

export async function markOutboxFailed(
  supabase: SupabaseClient,
  event: OutboxEventRow,
  errorMessage: string,
): Promise<'failed' | 'retry_scheduled'> {
  const attempts = event.attempts + 1
  const terminal = attempts >= OUTBOX_MAX_ATTEMPTS

  const { error } = await supabase
    .from('outbox_event')
    .update({
      attempts,
      last_error: errorMessage.slice(0, 2000),
      status: terminal ? 'failed' : 'pending',
      available_at: terminal
        ? event.available_at
        : new Date(Date.now() + backoffMs(attempts)).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', event.id)

  if (error) throw error
  return terminal ? 'failed' : 'retry_scheduled'
}

function backoffMs(attempts: number): number {
  return Math.min(60_000 * attempts, 300_000)
}
