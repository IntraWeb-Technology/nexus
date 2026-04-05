import { ActivityFeed } from '@/components/portal/ActivityFeed'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
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
  const items = (data ?? []) as ActivityLogRow[]

  return (
    <div className="space-y-4">
      <h1>Activity Log</h1>
      <ActivityFeed items={items} />
    </div>
  )
}
