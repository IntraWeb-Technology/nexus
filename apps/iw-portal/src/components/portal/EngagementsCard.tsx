import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import { fetchHubSpotDealsForContact } from '@/lib/hubspot/deals'
import { formatIsoDate, formatUsdFromString, truncateText } from '@/lib/portal/display'

export async function EngagementsCard() {
  const bundle = await getPortalBundle()
  if (!bundle) return null

  const contactId = bundle.client.hubspot_contact_id
  const deals = await fetchHubSpotDealsForContact(contactId)
  if (deals.length === 0) return null

  const portalProjectDealIds = new Set(
    bundle.projects.map((p) => p.hubspot_deal_id).filter(Boolean) as string[],
  )
  const activeDealId = bundle.project.hubspot_deal_id

  return (
    <Card>
      <p className="iw-label mb-2">Your engagements</p>
      <p className="mb-3 text-sm text-[var(--iw-text-2)]">
        Every engagement tied to your account in one place. If you have more than one project, choose the active
        project in the sidebar so billing and milestones match the engagement you&apos;re working in.
      </p>

      <div className="md:hidden space-y-3">
        {deals.map((d) => {
          const linked = portalProjectDealIds.has(d.id)
          const isActiveEngagement = activeDealId != null && activeDealId === d.id
          const stage = d.stageLabel ?? d.dealstage ?? '—'
          const pipeline = d.pipelineLabel ?? d.pipeline ?? '—'
          const notes = d.description ? truncateText(d.description, 200) : null
          return (
            <div
              key={d.id}
              className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-3 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium text-[var(--iw-text)]">{d.dealname}</p>
                <div className="flex flex-wrap gap-1">
                  {isActiveEngagement ? (
                    <span className="inline-block rounded bg-[var(--iw-slate-2)] px-1.5 py-0.5 text-xs text-[var(--iw-text-3)]">
                      Active project
                    </span>
                  ) : linked ? (
                    <span className="inline-block rounded bg-[var(--iw-slate-2)] px-1.5 py-0.5 text-xs text-[var(--iw-text-3)]">
                      Also in portal
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-1 text-xs text-[var(--iw-text-3)]">
                {pipeline} · {stage}
              </p>
              <p className="mt-2 text-sm text-[var(--iw-text)]">
                <span className="text-lg font-semibold">{formatUsdFromString(d.amount) ?? '—'}</span>
                <span className="text-[var(--iw-text-3)]"> · </span>
                <span className="text-[var(--iw-text-2)]">Expected close {formatIsoDate(d.closedate) ?? '—'}</span>
              </p>
              {notes ? (
                <p className="mt-2 line-clamp-2 text-xs text-[var(--iw-text-3)]" title={d.description ?? undefined}>
                  {notes}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-[var(--iw-border)] md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--iw-border)] text-[var(--iw-text-3)]">
            <tr>
              <th className="p-2 iw-label">Engagement</th>
              <th className="p-2 iw-label">Pipeline</th>
              <th className="p-2 iw-label">Stage</th>
              <th className="p-2 iw-label">Amount</th>
              <th className="p-2 iw-label">Expected close</th>
              <th className="p-2 iw-label">Created</th>
              <th className="p-2 iw-label">Notes</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => {
              const linked = portalProjectDealIds.has(d.id)
              const isActiveEngagement = activeDealId != null && activeDealId === d.id
              const stage = d.stageLabel ?? d.dealstage ?? '—'
              const pipeline = d.pipelineLabel ?? d.pipeline ?? '—'
              const notes = truncateText(d.description, 72)
              return (
                <tr key={d.id} className="border-b border-[var(--iw-border)] last:border-0 align-top">
                  <td className="p-2 text-[var(--iw-text)]">
                    <span className="font-medium">{d.dealname}</span>
                    {isActiveEngagement ? (
                      <span className="ml-2 inline-block rounded bg-[var(--iw-slate-2)] px-1.5 py-0.5 text-xs text-[var(--iw-text-3)]">
                        Active project
                      </span>
                    ) : linked ? (
                      <span className="ml-2 inline-block rounded bg-[var(--iw-slate-2)] px-1.5 py-0.5 text-xs text-[var(--iw-text-3)]">
                        Also in portal
                      </span>
                    ) : null}
                  </td>
                  <td className="p-2 text-[var(--iw-text-2)]">{pipeline}</td>
                  <td className="p-2 text-[var(--iw-text-2)]">{stage}</td>
                  <td className="p-2 text-[var(--iw-text)]">{formatUsdFromString(d.amount) ?? '—'}</td>
                  <td className="p-2 text-[var(--iw-text-2)]">{formatIsoDate(d.closedate) ?? '—'}</td>
                  <td className="p-2 text-[var(--iw-text-2)]">{formatIsoDate(d.createdate) ?? '—'}</td>
                  <td
                    className="max-w-[200px] p-2 text-[var(--iw-text-3)]"
                    title={d.description ?? undefined}
                  >
                    {notes ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
