import { fetchLatestPreCallIntake } from '@/lib/os-data/queries'
import { createServiceSupabase } from '@/lib/supabase/server'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'

/** Latest intake row for an email (case-insensitive). HubSpot join can use deal/contact routes by id from `payload`. */
export async function GET(request: Request) {
  if (!validateIntrawebSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = new URL(request.url).searchParams.get('email') ?? ''
  try {
    const supabase = createServiceSupabase()
    const { row, error } = await fetchLatestPreCallIntake(supabase, email)
    if (error && error.message === 'missing email') {
      return NextResponse.json({ error: 'Missing email query param' }, { status: 400 })
    }
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ row })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes('Missing Supabase API URL') || message.includes('Missing NEXT_PUBLIC_SUPABASE_URL')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
