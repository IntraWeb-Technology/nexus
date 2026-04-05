import { HubSpotSummaryCard } from '@/components/portal/HubSpotSummaryCard'
import { PortalLiveDataCard } from '@/components/portal/PortalLiveDataCard'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { PlanSummary } from '@/components/portal/PlanSummary'
import { ProgressBar } from '@/components/portal/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Invoice, Milestone, NotificationRow } from '@/lib/supabase/types'
import Link from 'next/link'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function greetingName(full: string) {
  return full.split(/\s+/)[0] ?? full
}

function partOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const pid = bundle.project.id

  const [msRes, invRes, notRes] = await Promise.all([
    supabase.from('milestones').select('*').eq('project_id', pid).order('sort_order', { ascending: true }),
    supabase.from('invoices').select('*').eq('project_id', pid),
    supabase.from('notifications').select('*').eq('project_id', pid).order('created_at', { ascending: false }),
  ])

  const milestones = (msRes.data ?? []) as Milestone[]
  const invoices = (invRes.data ?? []) as Invoice[]
  const notifications = (notRes.data ?? []) as NotificationRow[]

  const paidCents = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount_cents, 0)
  const balanceDue = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((s, i) => s + i.amount_cents, 0)

  const start = bundle.project.start_date ? new Date(bundle.project.start_date) : null
  const daysSince = start
    ? Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000))
    : 0

  const recent = [...milestones].sort((a, b) => a.sort_order - b.sort_order).slice(-4).reverse()
  const pendingAction = notifications.find((n) => n.type === 'action_required' && !n.read)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[var(--iw-text)]">
          {partOfDay()}, {greetingName(bundle.client.name)}
        </h1>
        <p className="mt-1 text-sm text-[var(--iw-text-2)]">
          Your project status as of {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall progress" value={`${bundle.project.progress_pct}%`} />
        <StatCard label="Days since start" value={String(daysSince)} />
        <StatCard label="Deposit paid" value={money(paidCents)} />
        <StatCard label="Balance due" value={money(balanceDue)} />
      </div>

      <PortalLiveDataCard
        projectSlug={bundle.project.slug}
        projectId={bundle.project.id}
        plan={bundle.project.plan}
        hubspotDealId={bundle.project.hubspot_deal_id}
        hubspotContactId={bundle.client.hubspot_contact_id}
        invoiceCount={invoices.length}
        milestoneCount={milestones.length}
        notificationCount={notifications.length}
      />

      <HubSpotSummaryCard />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="iw-label mb-2">Phase progress</p>
          <ProgressBar value={bundle.project.progress_pct} />
          <p className="mt-3 text-sm text-[var(--iw-text-2)]">
            Status: <span className="text-[var(--iw-text)]">{bundle.project.status}</span>
          </p>
          <p className="mt-4 iw-label">Recent milestones</p>
          <ul className="mt-2 space-y-2 text-sm text-[var(--iw-text)]">
            {recent.map((m) => (
              <li key={m.id} className="flex justify-between gap-2 border-b border-[var(--iw-border)] pb-2 last:border-0">
                <span>{m.title}</span>
                <span className="text-[var(--iw-text-3)]">{m.status}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-4">
          {pendingAction ? (
            <Card>
              <p className="iw-label mb-1">Pending action</p>
              <p className="font-medium text-[var(--iw-text)]">{pendingAction.title}</p>
              <p className="mt-1 text-sm text-[var(--iw-text-2)]">{pendingAction.body}</p>
            </Card>
          ) : (
            <Card>
              <p className="iw-label mb-1">Pending action</p>
              <p className="text-sm text-[var(--iw-text-2)]">No action items right now.</p>
            </Card>
          )}
          <PlanSummary plan={bundle.project.plan} />
        </div>
      </div>

      <div>
        <Link href="/messages">
          <Button variant="primary" className="w-full sm:w-auto">
            Send a message
          </Button>
        </Link>
      </div>
    </div>
  )
}
