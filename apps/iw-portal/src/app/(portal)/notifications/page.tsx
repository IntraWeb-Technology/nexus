import { ActivityFeed } from '@/components/portal/ActivityFeed'
import { ActivityMergedFeed } from '@/components/portal/ActivityMergedFeed'
import { HubSpotGate } from '@/components/portal/HubSpotGate'
import { MarkNotificationsReadButton } from '@/components/portal/MarkNotificationsReadButton'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { mergeActivityFeed } from '@/lib/activity/merge'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { ActivityLogRow } from '@/lib/supabase/types'

export default async function NotificationsPage() {
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1>Notifications</h1>
          <p className="mt-1 max-w-[52ch] text-sm text-[var(--iw-text-2)]">
            Your project timeline — milestones, proposals, meetings, documents, and billing updates.
            Alert badges clear when you mark notifications as read.
          </p>
        </div>
        <MarkNotificationsReadButton unreadCount={bundle.unreadNotifications} />
      </div>

      <section aria-labelledby="updates-heading">
        <h2 id="updates-heading" className="sr-only">
          Update timeline
        </h2>
        <HubSpotGate fallback={<ActivityFeed items={portalOnlyItems} />}>
          <ActivityMergedFeed
            projectId={bundle.project.id}
            hubspotDealId={bundle.project.hubspot_deal_id}
            hubspotContactId={bundle.client.hubspot_contact_id}
            portalRows={portalRows}
          />
        </HubSpotGate>
      </section>
    </div>
  )
}
