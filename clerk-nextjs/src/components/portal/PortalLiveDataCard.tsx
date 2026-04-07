import { Card } from '@/components/ui/Card'

function planLabel(plan: string): string {
  if (plan === 'growth') return 'Growth'
  if (plan === 'starter') return 'Starter'
  return 'Custom'
}

/** Client-facing snapshot for the active project only — no internal system IDs. */
export function PortalLiveDataCard(props: {
  projectSlug: string
  plan: string
  milestoneCount: number
  invoiceCount: number
  notificationCount: number
  multiProject: boolean
}) {
  return (
    <Card>
      <p className="iw-label mb-2">This project</p>
      <p className="mb-3 text-sm text-[var(--iw-text-2)]">
        {props.multiProject
          ? 'Everything below applies to the project you selected in the sidebar. Switch projects there to see another engagement’s milestones and billing.'
          : 'Milestones, invoices, and notifications for your project.'}
      </p>
      <div className="text-sm">
        <div className="flex flex-wrap justify-between gap-2 border-b border-[var(--iw-border)] py-2">
          <span className="text-[var(--iw-text-3)]">Project</span>
          <span className="iw-mono text-[var(--iw-text)]">{props.projectSlug}</span>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-b border-[var(--iw-border)] py-2">
          <span className="text-[var(--iw-text-3)]">Plan</span>
          <span className="text-[var(--iw-text)]">{planLabel(props.plan)}</span>
        </div>
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
