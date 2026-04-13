import { MessageThread } from '@/components/portal/MessageThread'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Message } from '@/lib/supabase/types'

export default async function MessagesPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('created_at', { ascending: true })
  const messages = (data ?? []) as Message[]

  return (
    <div className="space-y-4">
      <h1>Messages</h1>
      <MessageThread projectId={bundle.project.id} initialMessages={messages} />
    </div>
  )
}
