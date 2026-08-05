import { Card } from '@/components/ui/Card'

/** Client-facing snapshot for the active project only — no internal system IDs. */
export function PortalLiveDataCard(props: {
  projectName: string
  tier: string | null
  milestoneCount: number
  invoiceCount: number
  notificationCount: number
  multiProject: boolean
}) {
  return (
    <Card>
      <p className="iw-label mb-2">This project</p>
      <p className="mb-4 text-sm leading-relaxed text-[var(--iw-text-2)]">
        {props.multiProject
          ? 'Everything below applies to the project you selected in the sidebar. Switch projects there to see another engagement’s milestones and billing.'
          : 'Milestones, invoices, and notifications for your project.'}
      </p>
      <div className="text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--iw-slate-2)]/60 px-3 py-2.5">
          <span className="text-[var(--iw-text-3)]">Project</span>
          <span className="font-medium text-[var(--iw-text)]">{props.projectName}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--iw-slate-2)]/60 px-3 py-2.5">
          <span className="text-[var(--iw-text-3)]">Tier</span>
          <span className="font-medium text-[var(--iw-text)]">{props.tier?.trim() || 'Not set'}</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--iw-border)] pt-4">
          <div className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/40 px-2 py-3 text-center transition-colors duration-200 hover:border-[var(--iw-border-2)]">
            <p className="text-xl font-semibold tabular-nums text-[var(--iw-text)] md:text-2xl">
              {props.milestoneCount}
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-3)]">
              Milestones
            </p>
          </div>
          <div className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/40 px-2 py-3 text-center transition-colors duration-200 hover:border-[var(--iw-border-2)]">
            <p className="text-xl font-semibold tabular-nums text-[var(--iw-text)] md:text-2xl">
              {props.invoiceCount}
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-3)]">
              Invoices
            </p>
          </div>
          <div className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/40 px-2 py-3 text-center transition-colors duration-200 hover:border-[var(--iw-border-2)]">
            <p className="text-xl font-semibold tabular-nums text-[var(--iw-text)] md:text-2xl">
              {props.notificationCount}
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-3)]">
              Alerts
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
