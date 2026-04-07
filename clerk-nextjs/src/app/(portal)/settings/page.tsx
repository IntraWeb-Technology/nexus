import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { NotificationPreferences } from '@/lib/supabase/types'
import { SettingsPreferences } from './preferences'

export default async function SettingsPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('client_id', bundle.client.id)
    .maybeSingle()

  const p = (prefs ?? null) as NotificationPreferences | null

  return (
    <div className="space-y-6">
      <h1>Settings</h1>
      <Card>
        <p className="iw-label mb-3">Account</p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--iw-text-3)]">Name</dt>
            <dd className="text-[var(--iw-text)]">{bundle.client.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--iw-text-3)]">Email</dt>
            <dd className="text-[var(--iw-text)]">{bundle.client.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--iw-text-3)]">Phone</dt>
            <dd className="text-[var(--iw-text)]">{bundle.client.phone ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--iw-text-3)]">Project</dt>
            <dd className="iw-mono text-[var(--iw-text)]">{bundle.project.slug}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--iw-text-3)]">Contact reference</dt>
            <dd className="break-all iw-mono text-xs text-[var(--iw-text)]">
              {bundle.client.hubspot_contact_id ?? '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--iw-text-3)]">Engagement reference</dt>
            <dd className="break-all iw-mono text-xs text-[var(--iw-text)]">
              {bundle.project.hubspot_deal_id ?? '—'}
            </dd>
          </div>
        </dl>
      </Card>
      <SettingsPreferences clientId={bundle.client.id} initial={p} />
    </div>
  )
}
