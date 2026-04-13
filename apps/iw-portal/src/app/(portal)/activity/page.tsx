import { ActivityFeed } from '@/components/portal/ActivityFeed'
import { ActivityMergedFeed } from '@/components/portal/ActivityMergedFeed'
import { HubSpotGate } from '@/components/portal/HubSpotGate'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { mergeActivityFeed } from '@/lib/activity/merge'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { ActivityLogRow } from '@/lib/supabase/types'

export default async function ActivityPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />

  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('created_at', { ascending: false })

  const portalRows = (data ?? []) as ActivityLogRow[]
  const portalOnlyItems = mergeActivityFeed(portalRows, [])

  return (
    <div className="iw-animate-slide-up space-y-6">
      <div>
        <h1>Activity Log</h1>
        <p className="mt-1 text-sm text-[var(--iw-text-2)]">
          A timeline of all project events, messages, and team updates.
        </p>
      </div>
      <HubSpotGate fallback={<ActivityFeed items={portalOnlyItems} />}>
        <ActivityMergedFeed
          projectId={bundle.project.id}
          hubspotDealId={bundle.project.hubspot_deal_id}
          hubspotContactId={bundle.client.hubspot_contact_id}
          portalRows={portalRows}
        />
      </HubSpotGate>
    </div>
  )
}
