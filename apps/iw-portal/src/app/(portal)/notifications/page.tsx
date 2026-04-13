import { NotificationList } from '@/components/portal/NotificationList'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { NotificationRow } from '@/lib/supabase/types'

export default async function NotificationsPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('created_at', { ascending: false })
  const notifications = (data ?? []) as NotificationRow[]

  return (
    <div className="space-y-4">
      <h1>Notifications</h1>
      <NotificationList projectId={bundle.project.id} initial={notifications} />
    </div>
  )
}
