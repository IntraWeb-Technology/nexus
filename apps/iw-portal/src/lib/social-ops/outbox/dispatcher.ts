import { createServiceSupabase } from '@/lib/supabase/server'
import { handleOutboxEvent } from '@/lib/social-ops/outbox/handlers/google-chat'
import {
  fetchDueOutboxEvents,
  markOutboxFailed,
  markOutboxPublished,
} from '@/lib/social-ops/outbox/outbox-queries'

export interface DispatchOutboxResult {
  processed: number
  published: number
  failed: number
  retry_scheduled: number
}

export async function dispatchOutboxBatch(): Promise<DispatchOutboxResult> {
  const supabase = createServiceSupabase()
  const events = await fetchDueOutboxEvents(supabase)

  const result: DispatchOutboxResult = {
    processed: 0,
    published: 0,
    failed: 0,
    retry_scheduled: 0,
  }

  for (const event of events) {
    result.processed += 1
    try {
      await handleOutboxEvent(event)
      await markOutboxPublished(supabase, event.id)
      result.published += 1
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      const outcome = await markOutboxFailed(supabase, event, message)
      if (outcome === 'failed') {
        result.failed += 1
      } else {
        result.retry_scheduled += 1
      }
    }
  }

  return result
}
