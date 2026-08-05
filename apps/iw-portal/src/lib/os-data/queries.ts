import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  OsAutomationLogRow,
  OsClientSuccessClientRow,
  OsContractsQueueRow,
  OsDealsSheetRow,
  OsLeadRow,
  OsPreCallIntakeRow,
} from '@/lib/supabase/types'

export async function fetchOsDealBundle(supabase: SupabaseClient, hubspotDealId: string) {
  const id = hubspotDealId.trim()
  const [dealsRes, queueRes, csRes, leadsRes] = await Promise.all([
    supabase.from('os_deals_sheet').select('*').eq('hubspot_deal_id', id).maybeSingle(),
    supabase.from('os_contracts_queue').select('*').eq('hubspot_deal_id', id),
    supabase.from('os_client_success_clients').select('*').eq('hubspot_deal_id', id).maybeSingle(),
    supabase.from('os_leads').select('*').eq('hubspot_deal_id', id).order('occurred_at', { ascending: false }).limit(50),
  ])

  return {
    deals_sheet: (dealsRes.data ?? null) as OsDealsSheetRow | null,
    contracts_queue: (queueRes.data ?? []) as OsContractsQueueRow[],
    client_success: (csRes.data ?? null) as OsClientSuccessClientRow | null,
    leads: (leadsRes.data ?? []) as OsLeadRow[],
    errors: [dealsRes.error, queueRes.error, csRes.error, leadsRes.error].filter(Boolean),
  }
}

export async function fetchAutomationLog(
  supabase: SupabaseClient,
  opts: { hubspotDealId?: string; hubspotContactId?: string; limit: number },
) {
  const deal = opts.hubspotDealId?.trim()
  const contact = opts.hubspotContactId?.trim()
  if (!deal && !contact) {
    return {
      rows: [] as OsAutomationLogRow[],
      error: new Error('Provide hubspotDealId and/or hubspotContactId'),
    }
  }

  let q = supabase
    .from('os_automation_log')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(Math.min(Math.max(opts.limit, 1), 500))

  if (deal) q = q.eq('hubspot_deal_id', deal)
  if (contact) q = q.eq('hubspot_contact_id', contact)

  const { data, error } = await q
  return { rows: (data ?? []) as OsAutomationLogRow[], error }
}

export async function fetchContractsQueue(
  supabase: SupabaseClient,
  opts: { status?: string; queueType?: 'contract' | 'proposal'; limit: number },
) {
  let q = supabase
    .from('os_contracts_queue')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(Math.min(Math.max(opts.limit, 1), 500))

  if (opts.status?.trim()) {
    q = q.eq('status', opts.status.trim())
  }
  if (opts.queueType) {
    q = q.eq('queue_type', opts.queueType)
  }

  const { data, error } = await q
  return { rows: (data ?? []) as OsContractsQueueRow[], error }
}

export async function fetchLatestPreCallIntake(supabase: SupabaseClient, email: string) {
  const raw = email.trim()
  if (!raw) return { row: null as OsPreCallIntakeRow | null, error: new Error('missing email') }

  const safe = raw.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
  const { data, error } = await supabase
    .from('os_pre_call_intake')
    .select('*')
    .ilike('email', safe)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { row: (data ?? null) as OsPreCallIntakeRow | null, error }
}
