import { batchReadDeals } from '@/lib/hubspot/batch-read'
import { getHubSpotPrivateAppToken } from '@/lib/hubspot/config'
import { fetchContractsQueue } from '@/lib/os-data/queries'
import { createServiceSupabase } from '@/lib/supabase/server'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  if (!validateIntrawebSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? undefined
  const queueType = url.searchParams.get('queueType') as 'contract' | 'proposal' | null
  const limit = Number(url.searchParams.get('limit') ?? '200')

  const qt =
    queueType === 'contract' || queueType === 'proposal' ? queueType : undefined

  try {
    const supabase = createServiceSupabase()
    const { rows, error } = await fetchContractsQueue(supabase, {
      status: status ?? undefined,
      queueType: qt,
      limit: Number.isFinite(limit) ? limit : 200,
    })

    if (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }

    const token = getHubSpotPrivateAppToken()
    if (!token) {
      return NextResponse.json({ hubspotConfigured: false, rows, hubspot: { deals: {} } })
    }

    const dealIds = new Set<string>()
    for (const r of rows) {
      if (r.hubspot_deal_id) dealIds.add(r.hubspot_deal_id)
    }

    const dealsMap = dealIds.size ? await batchReadDeals(token, [...dealIds]) : new Map()
    const deals: Record<string, Record<string, string | null>> = {}
    for (const [k, v] of dealsMap) deals[k] = v

    return NextResponse.json({
      hubspotConfigured: true,
      rows,
      hubspot: { deals },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes('Missing Supabase API URL') || message.includes('Missing NEXT_PUBLIC_SUPABASE_URL')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
