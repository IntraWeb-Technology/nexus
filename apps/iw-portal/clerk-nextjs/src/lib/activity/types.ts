import type { ActivityLogRow } from '@/lib/supabase/types'

/** Portal DB row + HubSpot CRM timeline rows merged for the activity feed. */
export type ActivityFeedItem =
  | (ActivityLogRow & { source: 'portal' })
  | {
      id: string
      project_id: string
      type: string
      label: string
      detail: string | null
      created_at: string
      source: 'hubspot'
    }
