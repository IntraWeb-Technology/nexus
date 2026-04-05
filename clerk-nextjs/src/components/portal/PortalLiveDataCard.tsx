import { Card } from '@/components/ui/Card'

function row(label: string, value: string | null | undefined) {
  if (value == null || value === '') return null
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-[var(--iw-border)] py-2 last:border-0">
      <span className="text-[var(--iw-text-3)]">{label}</span>
      <span className="break-all text-right font-mono text-xs text-[var(--iw-text)]">{value}</span>
    </div>
  )
}

/**
 * Surfaces identifiers and row counts so it is obvious the dashboard is backed by live Supabase + HubSpot IDs.
 */
export function PortalLiveDataCard(props: {
  projectSlug: string
  projectId: string
  plan: string
  hubspotDealId: string | null
  hubspotContactId: string | null
  invoiceCount: number
  milestoneCount: number
  notificationCount: number
}) {
  const shortId = `${props.projectId.slice(0, 8)}…`

  return (
    <Card>
      <p className="iw-label mb-2">Live data (this session)</p>
      <p className="mb-3 text-sm text-[var(--iw-text-2)]">
        Loaded from Supabase for your signed-in Clerk account (your{' '}
        <span className="text-[var(--iw-text)]">most recently created</span> project when you have more than one).
        HubSpot rows below are read with your server token when IDs are set.
      </p>
      <div className="text-sm">
        {row('Project slug', props.projectSlug)}
        {row('Plan', props.plan)}
        {row('Project id', shortId)}
        {row('HubSpot deal id', props.hubspotDealId)}
        {row('HubSpot contact id', props.hubspotContactId)}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--iw-border)] pt-3 text-center">
          <div>
            <p className="text-2xl font-semibold text-[var(--iw-text)]">{props.milestoneCount}</p>
            <p className="text-xs text-[var(--iw-text-3)]">Milestones</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-[var(--iw-text)]">{props.invoiceCount}</p>
            <p className="text-xs text-[var(--iw-text-3)]">Invoices</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-[var(--iw-text)]">{props.notificationCount}</p>
            <p className="text-xs text-[var(--iw-text-3)]">Notifications</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
