import type { ActivityFeedItem } from '@/lib/activity/types'
import type { ActivityLogRow } from '@/lib/supabase/types'

/**
 * HubSpot notes created by portal automation (and similar integrations) sync back into the merged
 * activity feed as generic "Note" rows and duplicate human-facing portal events.
 */
function isAutomatedHubSpotNoteBody(detail: string | null | undefined): boolean {
  const t = detail?.trim()
  if (!t) return true
  const lower = t.toLowerCase()
  return (
    /portal proposal (approved|rejected)/i.test(t) ||
    /portal notification\b/i.test(t) ||
    /postgres\s*backfill/i.test(lower) ||
    /\bintraweb client portal\b/i.test(lower) ||
    /\bintraweb portal\s*\/?\s*postgres/i.test(lower) ||
    /\bsource:\s*intraweb/i.test(lower) ||
    /\btype:\s*action_required\b/i.test(lower) ||
    /\bproject:\s*cl-[a-z0-9]{10,}/i.test(lower) ||
    /\bapproved proposal status\b/i.test(lower)
  )
}

function includePortalActivityRow(row: Pick<ActivityLogRow, 'type' | 'label'>): boolean {
  if (row.type === 'milestone' && row.label === 'Milestone updated') {
    return false
  }
  return true
}

/** Portal-only rows (e.g. dashboard recent activity). */
export function filterPortalActivityRows(rows: ActivityLogRow[]): ActivityLogRow[] {
  return rows.filter(includePortalActivityRow)
}

/** Merged portal + HubSpot timeline for `/notifications`. */
export function filterActivityFeedItems(items: ActivityFeedItem[]): ActivityFeedItem[] {
  return items.filter((item) => {
    if (item.source === 'portal') {
      return includePortalActivityRow(item)
    }
    if (item.source === 'hubspot' && item.type === 'hubspot_note') {
      return !isAutomatedHubSpotNoteBody(item.detail)
    }
    return true
  })
}
