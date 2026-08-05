import { canMutateStaff, getStaffProfile } from '@/lib/admin/auth'
import { listReviewBundles } from '@/lib/social-ops/reviews/review-queries'
import { createRlsSupabaseForUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const staff = await getStaffProfile()
  if (!staff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? undefined
  const limit = Number(url.searchParams.get('limit') ?? '50')

  try {
    const supabase = await createRlsSupabaseForUser()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unavailable' }, { status: 503 })
    }

    const reviews = await listReviewBundles(supabase, {
      status,
      limit: Number.isFinite(limit) ? limit : 50,
    })

    return NextResponse.json({
      reviews,
      staff_role: staff.role,
      can_mutate: canMutateStaff(staff.role),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
