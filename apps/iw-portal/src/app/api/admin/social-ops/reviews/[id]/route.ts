import { getStaffProfile } from '@/lib/admin/auth'
import { fetchReviewBundle } from '@/lib/social-ops/reviews/review-queries'
import { createRlsSupabaseForUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const staff = await getStaffProfile()
  if (!staff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const supabase = await createRlsSupabaseForUser()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unavailable' }, { status: 503 })
    }

    const bundle = await fetchReviewBundle(supabase, id)
    if (!bundle) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(bundle)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
