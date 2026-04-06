import type { ActivityFeedItem } from '@/lib/activity/types'
import type { ActivityLogRow } from '@/lib/supabase/types'

/** Merges portal activity_log rows with HubSpot CRM timeline items, newest first. */
export function mergeActivityFeed(portal: ActivityLogRow[], hubspot: ActivityFeedItem[]): ActivityFeedItem[] {
  const portalItems: ActivityFeedItem[] = portal.map((r) => ({ ...r, source: 'portal' as const }))
  const combined = [...portalItems, ...hubspot]
  combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return combined.slice(0, 150)
}
