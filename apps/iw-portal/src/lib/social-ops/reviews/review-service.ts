import { createServiceSupabase } from '@/lib/supabase/server'
import { logStaffAction } from '@/lib/admin/auth'
import type { ReviewActionCommand } from '@/lib/social-ops/schemas'
import { applyReviewResultSchema } from '@/lib/social-ops/schemas'
import type { ApplyReviewActionResult } from '@/lib/social-ops/types'

export async function applyReviewAction(input: {
  reviewItemId: string
  command: ReviewActionCommand
  actorStaffId: string
}): Promise<ApplyReviewActionResult> {
  const supabase = createServiceSupabase()

  const { data, error } = await supabase.rpc('apply_review_action', {
    p_review_item_id: input.reviewItemId,
    p_action: input.command.action,
    p_note: input.command.note ?? null,
    p_actor_staff_id: input.actorStaffId,
  })

  if (error) {
    const message = error.message ?? 'Review action failed'
    if (message.includes('not pending')) {
      const conflict = new Error(message)
      ;(conflict as Error & { status: number }).status = 409
      throw conflict
    }
    if (message.includes('not found')) {
      const notFound = new Error(message)
      ;(notFound as Error & { status: number }).status = 404
      throw notFound
    }
    throw new Error(message)
  }

  const parsed = applyReviewResultSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Invalid review action RPC response shape')
  }

  await logStaffAction({
    action: `social_ops.review.${input.command.action}`,
    resourceType: 'review_item',
    resourceId: input.reviewItemId,
    metadata: { note_present: Boolean(input.command.note) },
  })

  return parsed.data
}
