import { ActivityFeed } from '@/components/portal/ActivityFeed'
import { mergeActivityFeed } from '@/lib/activity/merge'
import { fetchHubSpotActivityFeed } from '@/lib/hubspot/activity'
import type { ActivityLogRow } from '@/lib/supabase/types'

export async function ActivityMergedFeed({
  projectId,
  hubspotDealId,
  hubspotContactId,
  portalRows,
}: {
  projectId: string
  hubspotDealId: string | null
  hubspotContactId: string | null
  portalRows: ActivityLogRow[]
}) {
  const hubspotItems = await fetchHubSpotActivityFeed({
    hubspotDealId,
    hubspotContactId,
    projectId,
  })
  const items = mergeActivityFeed(portalRows, hubspotItems)
  return <ActivityFeed items={items} />
}
