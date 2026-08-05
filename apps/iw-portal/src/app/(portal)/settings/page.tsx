import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import { fetchDeal } from '@/lib/hubspot/client'
import { isHubSpotConfigured } from '@/lib/hubspot/config'
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

function firstNonEmpty(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const next = value?.trim()
    if (next) return next
  }
  return null
}

function readableProjectName(slug: string): string {
  if (slug.startsWith('cl-')) return 'Your project'
  return slug.replace(/[-_]+/g, ' ').trim() || 'Your project'
}

function formatMetadataDate(value: string | null): string {
  if (!value) return 'Not set'
  const ms = Date.parse(value)
  if (Number.isNaN(ms)) return value
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
  const hubspotDeal = isHubSpotConfigured() && bundle.project.hubspot_deal_id
    ? await fetchDeal(bundle.project.hubspot_deal_id, [
        'dealname',
        'status_for_projects',
        'pipeline_stage_for_projects',
        'target_due_date_for_projects',
        'tier',
        'deal_tier',
        'project_tier',
        'service_tier',
      ]).catch(() => null)
    : null

  const dealProps = hubspotDeal?.properties ?? {}
  const projectName =
    firstNonEmpty(dealProps.dealname, bundle.client.company, readableProjectName(bundle.project.slug)) ??
    'Your project'
  const status = firstNonEmpty(dealProps.status_for_projects)
  const stage = firstNonEmpty(dealProps.pipeline_stage_for_projects)
  const dueDate = firstNonEmpty(dealProps.target_due_date_for_projects)
  const tier = firstNonEmpty(
    dealProps.tier,
    dealProps.deal_tier,
    dealProps.project_tier,
    dealProps.service_tier,
  )

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
            {projectName}
          </AccountRow>
        </dl>
      </Card>

      <Card>
        <p className="iw-label mb-1">Engagement metadata</p>
        <p className="mb-3 text-xs text-[var(--iw-text-3)]">
          Project metadata synced from HubSpot.
        </p>
        <dl>
          <AccountRow label="Status">{status ?? 'Not set'}</AccountRow>
          <AccountRow label="Stage">{stage ?? 'Not set'}</AccountRow>
          <AccountRow label="Due date">{formatMetadataDate(dueDate)}</AccountRow>
          <AccountRow label="Tier">{tier ?? 'Not set'}</AccountRow>
        </dl>
      </Card>

      <SettingsPreferences clientId={bundle.client.id} initial={p} />
    </div>
  )
}
