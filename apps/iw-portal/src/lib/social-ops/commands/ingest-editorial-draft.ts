import { createServiceSupabase } from '@/lib/supabase/server'
import { logStaffAction } from '@/lib/admin/auth'
import type { IngestEditorialDraftCommand } from '@/lib/social-ops/schemas'
import { ingestResultSchema } from '@/lib/social-ops/schemas'
import { portalReviewUrl, type IngestEditorialDraftResult } from '@/lib/social-ops/types'

export async function ingestEditorialDraft(
  command: IngestEditorialDraftCommand,
): Promise<IngestEditorialDraftResult> {
  const supabase = createServiceSupabase()
  const payload = {
    ...command,
    review_url: portalReviewUrl(),
  }

  const { data, error } = await supabase.rpc('ingest_editorial_draft', {
    p_payload: payload,
  })

  if (error) {
    throw new Error(error.message)
  }

  const parsed = ingestResultSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Invalid ingest RPC response shape')
  }

  return {
    ...parsed.data,
    outbox_event_id: parsed.data.outbox_event_id ?? '',
  }
}
