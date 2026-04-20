import { batchReadContacts, batchReadDeals } from '@/lib/hubspot/batch-read'
import { getHubSpotPrivateAppToken } from '@/lib/hubspot/config'
import { fetchOsDealBundle } from '@/lib/os-data/queries'
import { createServiceSupabase } from '@/lib/supabase/server'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'

export async function GET(request: Request, ctx: { params: Promise<{ dealId: string }> }) {
  if (!validateIntrawebSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { dealId } = await ctx.params
  const id = dealId?.trim()
  if (!id) {
    return NextResponse.json({ error: 'Missing dealId' }, { status: 400 })
  }

  try {
    const supabase = createServiceSupabase()
    const os = await fetchOsDealBundle(supabase, id)

    if (os.errors.length) {
      return NextResponse.json(
        { error: 'Supabase query failed', details: os.errors.map((e) => String(e)) },
        { status: 500 },
      )
    }

    const token = getHubSpotPrivateAppToken()
    if (!token) {
      return NextResponse.json({
        hubspotConfigured: false,
        os,
        hubspot: { deal: null, contacts: {} },
      })
    }

    const dealMap = await batchReadDeals(token, [id])
    const deal = dealMap.get(id) ?? null

    const contactIds = new Set<string>()
    if (os.deals_sheet?.hubspot_contact_id) contactIds.add(os.deals_sheet.hubspot_contact_id)
    for (const lead of os.leads) {
      if (lead.hubspot_contact_id) contactIds.add(lead.hubspot_contact_id)
    }

    const contacts: Record<string, Record<string, string | null>> = {}
    if (contactIds.size > 0) {
      const cmap = await batchReadContacts(token, [...contactIds])
      for (const [cid, props] of cmap) {
        contacts[cid] = props
      }
    }

    return NextResponse.json({
      hubspotConfigured: true,
      os,
      hubspot: { deal, contacts },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes('Missing Supabase API URL') || message.includes('Missing NEXT_PUBLIC_SUPABASE_URL')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
