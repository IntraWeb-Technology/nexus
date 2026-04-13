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
    <div className="iw-animate-slide-up space-y-8">
      <header className="border-b border-[var(--iw-border)] pb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--iw-text)] md:text-[1.75rem]">
          Messages
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--iw-text-2)] md:text-[15px]">
          Thread with the IntraWeb team for{' '}
          <span className="iw-mono font-medium text-[var(--iw-text)]">{bundle.project.slug}</span>. Replies appear
          here in real time when you keep this page open.
        </p>
      </header>
      <MessageThread projectId={bundle.project.id} initialMessages={messages} />
    </div>
  )
}
