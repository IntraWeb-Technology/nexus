import { MilestoneTimeline } from '@/components/portal/MilestoneTimeline'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { ProgressBar } from '@/components/portal/ProgressBar'
import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Milestone } from '@/lib/supabase/types'

export default async function ProgressPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const { data } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('sort_order', { ascending: true })
  const milestones = (data ?? []) as Milestone[]

  return (
    <div className="space-y-6">
      <h1>Project Progress</h1>
      <Card>
        <p className="iw-label mb-2">Overall</p>
        <ProgressBar value={bundle.project.progress_pct} />
        <p className="mt-2 text-sm text-[var(--iw-text-2)]">
          Current phase emphasis follows your milestones below — we keep this aligned with HubSpot and
          delivery checkpoints.
        </p>
      </Card>
      <div>
        <h2 className="mb-3 text-base font-medium text-[var(--iw-text)]">Milestones</h2>
        <MilestoneTimeline milestones={milestones} />
      </div>
      <Card>
        <p className="iw-label mb-2">What&apos;s included</p>
        {bundle.project.plan === 'growth' ? (
          <ul className="list-inside list-disc space-y-1 text-sm text-[var(--iw-text-2)]">
            <li>Everything in Starter</li>
            <li>Advanced integrations and AI features</li>
            <li>Booking and payments flows</li>
            <li>Copywriting included</li>
          </ul>
        ) : (
          <ul className="list-inside list-disc space-y-1 text-sm text-[var(--iw-text-2)]">
            <li>Up to five core pages and supporting layouts</li>
            <li>Contact forms and lead intake automation</li>
            <li>Vercel deployment and launch support</li>
          </ul>
        )}
        <p className="mt-3 text-sm text-[var(--iw-text-3)]">
          Exclusions: third-party subscription fees, paid media spend, and out-of-scope custom software
          outside your statement of work.
        </p>
      </Card>
    </div>
  )
}
