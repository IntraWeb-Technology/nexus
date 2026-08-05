import { MilestoneTimeline } from '@/components/portal/MilestoneTimeline'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { ProposalReviewCard } from '@/components/portal/ProposalReviewCard'
import { ProgressBar } from '@/components/portal/ProgressBar'
import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import { DEAL_SUMMARY_PROPERTIES, fetchDeal } from '@/lib/hubspot/client'
import { fetchHubSpotDealLineItems } from '@/lib/hubspot/line-items'
import { createServerSupabaseForUser, createServiceSupabase } from '@/lib/supabase/server'
import type { Milestone, MilestoneApproval, OsContractsQueueRow } from '@/lib/supabase/types'

function formatProjectDate(value: string | null): string {
  if (!value) return 'Not set'
  const raw = value.trim()
  const asNumber = Number(raw)
  const parsed = Number.isFinite(asNumber) && raw !== '' ? new Date(asNumber) : new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw
  return parsed.toLocaleDateString()
}

function formatProjectStatus(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function firstNonEmpty(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const next = value?.trim()
    if (next) return next
  }
  return null
}

export default async function ProgressPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const pid = bundle.project.id

  const [{ data: msData }, { data: apprData }, proposalRows, lineItems, hubspotDeal] = await Promise.all([
    supabase.from('milestones').select('*').eq('project_id', pid).order('sort_order', { ascending: true }),
    supabase.from('milestone_approvals').select('*').eq('project_id', pid),
    fetchActiveProjectProposals(bundle.project.hubspot_deal_id),
    fetchHubSpotDealLineItems(bundle.project.hubspot_deal_id),
    bundle.project.hubspot_deal_id
      ? fetchDeal(bundle.project.hubspot_deal_id, ['target_due_date_for_projects', 'closedate']).catch(() => null)
      : Promise.resolve(null),
  ])
  const hubspotLaunchDate = firstNonEmpty(
    hubspotDeal?.properties?.target_due_date_for_projects,
    hubspotDeal?.properties?.closedate,
  )
  const launchDate = hubspotLaunchDate ?? bundle.project.estimated_launch

  const milestones = (msData ?? []) as Milestone[]
  const approvals = (apprData ?? []) as MilestoneApproval[]
  const approvalsByMilestoneId: Record<string, MilestoneApproval> = {}
  for (const a of approvals) {
    approvalsByMilestoneId[a.milestone_id] = a
  }

  return (
    <div className="iw-animate-slide-up space-y-6">
      <div>
        <h1>Project Progress</h1>
        <p className="mt-1 text-sm text-[var(--iw-text-2)]">
          Track milestones, approve completed phases, and see how far you&apos;ve come.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="iw-label">Phase progress</p>
            <p className="mt-1 text-sm text-[var(--iw-text-2)]">
              Progress is aligned with your milestone approvals and delivery checkpoints below.
            </p>
          </div>
          <span className="rounded-full border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-3 py-1 text-xs font-medium text-[var(--iw-text-2)]">
            {formatProjectStatus(bundle.project.status)}
          </span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <ProgressBar value={bundle.project.progress_pct} />
          </div>
          <div className="text-right">
            <p className="text-4xl font-semibold tracking-tight text-[var(--iw-text)]">{Math.min(100, Math.max(0, bundle.project.progress_pct))}%</p>
            <p className="text-xs text-[var(--iw-text-3)]">Overall completion</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 border-t border-[var(--iw-border)] pt-4 text-sm sm:grid-cols-2">
          <p className="text-[var(--iw-text-2)]">
            <span className="iw-label mr-2">Started</span>
            <span className="text-[var(--iw-text)]">{formatProjectDate(bundle.project.start_date)}</span>
          </p>
          <p className="text-[var(--iw-text-2)]">
            <span className="iw-label mr-2">Launch</span>
            <span className="text-[var(--iw-text)]">{formatProjectDate(launchDate)}</span>
          </p>
        </div>
        <a
          href="#milestones"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-4 py-2 text-sm font-medium text-[var(--iw-text)] transition-colors hover:border-[var(--iw-teal-dim)] hover:text-[var(--iw-teal)]"
        >
          View detailed progress
          <span aria-hidden="true">&rarr;</span>
        </a>
      </Card>

      <ProposalReviewCard initialProposals={proposalRows} />

      <section id="milestones">
        <h2 className="mb-4 text-base font-semibold text-[var(--iw-text)]">Milestones</h2>
        <MilestoneTimeline milestones={milestones} approvalsByMilestoneId={approvalsByMilestoneId} />
      </section>

      <Card>
        <p className="iw-label mb-3">What&apos;s included in your plan</p>
        {lineItems.length ? (
          <ul className="space-y-2 text-sm text-[var(--iw-text-2)]">
            {lineItems.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <svg className="mt-0.5 shrink-0 text-[var(--iw-teal)]" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>
                  {item.name}
                  {item.quantity > 1 ? <span className="text-[var(--iw-text-3)]"> x{item.quantity}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : proposalRows[0]?.pain_points ? (
          <p className="text-sm leading-relaxed text-[var(--iw-text-2)]">{proposalRows[0].pain_points}</p>
        ) : bundle.project.plan === 'growth' ? (
          <ul className="space-y-2 text-sm text-[var(--iw-text-2)]">
            {[
              'Everything in Starter',
              'Advanced integrations and AI features',
              'Booking and payments flows',
              'Copywriting included',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <svg className="mt-0.5 shrink-0 text-[var(--iw-teal)]" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2 text-sm text-[var(--iw-text-2)]">
            {[
              'Up to five core pages and supporting layouts',
              'Contact forms and lead intake automation',
              'Vercel deployment and launch support',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <svg className="mt-0.5 shrink-0 text-[var(--iw-teal)]" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 border-t border-[var(--iw-border)] pt-3 text-xs text-[var(--iw-text-3)]">
          Exclusions: third-party subscription fees, paid media spend, and out-of-scope custom software
          outside your statement of work.
        </p>
      </Card>
    </div>
  )
}

async function fetchActiveProjectProposals(hubspotDealId: string | null): Promise<OsContractsQueueRow[]> {
  const dealId = hubspotDealId?.trim()
  if (!dealId) return []

  try {
    const supabase = createServiceSupabase()
    const [proposalRes, dealSheetRes, dealRes] = await Promise.all([
      supabase
        .from('os_contracts_queue')
        .select('*')
        .eq('hubspot_deal_id', dealId)
        .eq('queue_type', 'proposal')
        .order('updated_at', { ascending: false })
        .limit(5),
      supabase
        .from('os_deals_sheet')
        .select('tier')
        .eq('hubspot_deal_id', dealId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      fetchDeal(dealId, DEAL_SUMMARY_PROPERTIES).catch(() => null),
    ])

    const { data, error } = proposalRes
    if (error) {
      console.error('[progress] proposal queue', error)
      return []
    }
    const fallbackTier = dealSheetRes.data?.tier?.trim() || null
    const fallbackDealValue = dealRes?.properties?.amount?.trim() || null
    return ((data ?? []) as OsContractsQueueRow[]).map((row) => ({
      ...row,
      tier: row.tier?.trim() || fallbackTier,
      deal_value: row.deal_value?.trim() || fallbackDealValue,
    }))
  } catch (error) {
    console.error('[progress] proposal queue unavailable', error)
    return []
  }
}
