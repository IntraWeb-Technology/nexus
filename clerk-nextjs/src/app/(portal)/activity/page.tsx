import { ActivityFeed } from '@/components/portal/ActivityFeed'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { mergeActivityFeed } from '@/lib/activity/merge'
import { getPortalBundle } from '@/lib/data/portal'
import { fetchHubSpotActivityFeed } from '@/lib/hubspot/activity'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { ActivityLogRow } from '@/lib/supabase/types'

export default async function ActivityPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />

  const [{ data }, hubspotItems] = await Promise.all([
    supabase
      .from('activity_log')
      .select('*')
      .eq('project_id', bundle.project.id)
      .order('created_at', { ascending: false }),
    fetchHubSpotActivityFeed({
      hubspotDealId: bundle.project.hubspot_deal_id,
      hubspotContactId: bundle.client.hubspot_contact_id,
      projectId: bundle.project.id,
    }),
  ])

  const portalRows = (data ?? []) as ActivityLogRow[]
  const items = mergeActivityFeed(portalRows, hubspotItems)

  return (
    <div className="space-y-4">
      <h1>Activity Log</h1>
      <ActivityFeed items={items} />
    </div>
  )
}
