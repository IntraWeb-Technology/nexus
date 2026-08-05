import { batchReadContacts, batchReadDeals } from '@/lib/hubspot/batch-read'
import { getHubSpotPrivateAppToken } from '@/lib/hubspot/config'
import { fetchAutomationLog } from '@/lib/os-data/queries'
import { createServiceSupabase } from '@/lib/supabase/server'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  if (!validateIntrawebSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const hubspotDealId = url.searchParams.get('hubspotDealId') ?? undefined
  const hubspotContactId = url.searchParams.get('hubspotContactId') ?? undefined
  const limit = Number(url.searchParams.get('limit') ?? '100')

  try {
    const supabase = createServiceSupabase()
    const { rows, error } = await fetchAutomationLog(supabase, {
      hubspotDealId: hubspotDealId ?? undefined,
      hubspotContactId: hubspotContactId ?? undefined,
      limit: Number.isFinite(limit) ? limit : 100,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const token = getHubSpotPrivateAppToken()
    if (!token) {
      return NextResponse.json({ hubspotConfigured: false, rows, hubspot: { deals: {}, contacts: {} } })
    }

    const dealIds = new Set<string>()
    const contactIds = new Set<string>()
    for (const r of rows) {
      if (r.hubspot_deal_id) dealIds.add(r.hubspot_deal_id)
      if (r.hubspot_contact_id) contactIds.add(r.hubspot_contact_id)
    }

    const [dealsMap, contactsMap] = await Promise.all([
      dealIds.size ? batchReadDeals(token, [...dealIds]) : Promise.resolve(new Map()),
      contactIds.size ? batchReadContacts(token, [...contactIds]) : Promise.resolve(new Map()),
    ])

    const deals: Record<string, Record<string, string | null>> = {}
    const contacts: Record<string, Record<string, string | null>> = {}
    for (const [k, v] of dealsMap) deals[k] = v
    for (const [k, v] of contactsMap) contacts[k] = v

    return NextResponse.json({
      hubspotConfigured: true,
      rows,
      hubspot: { deals, contacts },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes('Missing Supabase API URL') || message.includes('Missing NEXT_PUBLIC_SUPABASE_URL')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
