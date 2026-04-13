import { MilestoneTimeline } from '@/components/portal/MilestoneTimeline'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { ProgressBar } from '@/components/portal/ProgressBar'
import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Milestone, MilestoneApproval } from '@/lib/supabase/types'

export default async function ProgressPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const pid = bundle.project.id

  const [{ data: msData }, { data: apprData }] = await Promise.all([
    supabase.from('milestones').select('*').eq('project_id', pid).order('sort_order', { ascending: true }),
    supabase.from('milestone_approvals').select('*').eq('project_id', pid),
  ])

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
        <p className="iw-label mb-3">Overall</p>
        <ProgressBar value={bundle.project.progress_pct} />
        <p className="mt-3 text-sm text-[var(--iw-text-2)]">
          Progress is aligned with your milestone approvals and delivery checkpoints below.
        </p>
      </Card>

      <section>
        <h2 className="mb-4 text-base font-semibold text-[var(--iw-text)]">Milestones</h2>
        <MilestoneTimeline milestones={milestones} approvalsByMilestoneId={approvalsByMilestoneId} />
      </section>

      <Card>
        <p className="iw-label mb-3">What&apos;s included in your plan</p>
        {bundle.project.plan === 'growth' ? (
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
