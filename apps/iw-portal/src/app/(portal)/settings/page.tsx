import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { NotificationPreferences } from '@/lib/supabase/types'
import { SettingsPreferences } from './preferences'

function AccountRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--iw-border)] py-3 last:border-b-0 last:pb-0 first:pt-0">
      <dt className="shrink-0 text-sm text-[var(--iw-text-3)]">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-[var(--iw-text)]">{children}</dd>
    </div>
  )
}

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
    <div className="iw-animate-slide-up space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="mt-1 text-sm text-[var(--iw-text-2)]">
          Manage your account details and notification preferences.
        </p>
      </div>

      <Card>
        <p className="iw-label mb-1">Account</p>
        <p className="mb-3 text-xs text-[var(--iw-text-3)]">
          Contact your project team to update these details.
        </p>
        <dl>
          <AccountRow label="Name">{bundle.client.name}</AccountRow>
          <AccountRow label="Email">{bundle.client.email}</AccountRow>
          <AccountRow label="Phone">{bundle.client.phone ?? '—'}</AccountRow>
          <AccountRow label="Project">
            <span className="iw-mono">{bundle.project.slug}</span>
          </AccountRow>
          <AccountRow label="Contact ref">
            <span className="iw-mono break-all text-xs text-[var(--iw-text-2)]">
              {bundle.client.hubspot_contact_id ?? '—'}
            </span>
          </AccountRow>
          <AccountRow label="Engagement ref">
            <span className="iw-mono break-all text-xs text-[var(--iw-text-2)]">
              {bundle.project.hubspot_deal_id ?? '—'}
            </span>
          </AccountRow>
        </dl>
      </Card>

      <SettingsPreferences clientId={bundle.client.id} initial={p} />
    </div>
  )
}
