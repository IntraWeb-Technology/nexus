import { canMutateStaff, getStaffProfile } from '@/lib/admin/auth'
import { applyReviewAction } from '@/lib/social-ops/reviews/review-service'
import { reviewActionSchema } from '@/lib/social-ops/schemas'
import { NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  const staff = await getStaffProfile()
  if (!staff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!canMutateStaff(staff.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = reviewActionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  try {
    const result = await applyReviewAction({
      reviewItemId: id,
      command: parsed.data,
      actorStaffId: staff.id,
    })
    return NextResponse.json(result)
  } catch (e) {
    const err = e as Error & { status?: number }
    const status = err.status ?? 500
    const message = err instanceof Error ? err.message : String(e)
    return NextResponse.json({ error: message }, { status })
  }
}
