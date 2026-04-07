import { AccountSummaryCard } from '@/components/portal/AccountSummaryCard'
import { DashboardQuickLinks } from '@/components/portal/DashboardQuickLinks'
import { EngagementsCard } from '@/components/portal/EngagementsCard'
import { HubSpotAccountFallback } from '@/components/portal/HubSpotAccountFallback'
import { HubSpotGate } from '@/components/portal/HubSpotGate'
import { PortalLiveDataCard } from '@/components/portal/PortalLiveDataCard'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { PlanSummary } from '@/components/portal/PlanSummary'
import { ProgressBar } from '@/components/portal/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { billingTotals, mergeBillingRows } from '@/lib/billing/types'
import { getPortalBundle } from '@/lib/data/portal'
import { isHubSpotConfigured } from '@/lib/hubspot/config'
import { fetchHubSpotBillingInvoices } from '@/lib/hubspot/invoices'
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
  const multiProject = bundle.projects.length > 1

  const [msRes, invRes, notRes, hubspotInvoices] = await Promise.all([
    supabase.from('milestones').select('*').eq('project_id', pid).order('sort_order', { ascending: true }),
    supabase.from('invoices').select('*').eq('project_id', pid),
    supabase.from('notifications').select('*').eq('project_id', pid).order('created_at', { ascending: false }),
    isHubSpotConfigured()
      ? fetchHubSpotBillingInvoices({
          hubspotDealId: bundle.project.hubspot_deal_id,
          hubspotContactId: bundle.client.hubspot_contact_id,
        })
      : Promise.resolve([]),
  ])

  const milestones = (msRes.data ?? []) as Milestone[]
  const supabaseInvoices = (invRes.data ?? []) as Invoice[]
  const notifications = (notRes.data ?? []) as NotificationRow[]

  /** Same merged view as Billing — includes CRM-backed invoices, not only portal DB rows. */
  const billingRows = mergeBillingRows(supabaseInvoices, hubspotInvoices)
  const { paid: paidCents, balance: balanceDue } = billingTotals(billingRows)
  const invoiceCount = billingRows.length

  const start = bundle.project.start_date ? new Date(bundle.project.start_date) : null
  /* Server component: wall clock for “days since start” — not a pure function by design. */
  const nowMs = new Date().getTime()
  const daysSince = start
    ? Math.max(0, Math.floor((nowMs - start.getTime()) / 86400000))
    : 0

  const recent = [...milestones].sort((a, b) => a.sort_order - b.sort_order).slice(-4).reverse()
  const pendingAction = notifications.find((n) => n.type === 'action_required' && !n.read)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-[var(--iw-text)] md:text-2xl">
          {partOfDay()}, {greetingName(bundle.client.name)}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--iw-text-2)]">
          Here’s where you stand on{' '}
          <span className="iw-mono font-medium text-[var(--iw-text)]">{bundle.project.slug}</span>
          {multiProject ? (
            <>
              {' '}
              <span className="text-[var(--iw-text-3)]">(use the sidebar to switch projects)</span>
            </>
          ) : null}{' '}
          — updated {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall progress" value={`${bundle.project.progress_pct}%`} />
        <StatCard label="Days since start" value={String(daysSince)} />
        <StatCard label="Paid to date" value={money(paidCents)} />
        <StatCard label="Balance due" value={money(balanceDue)} />
      </div>

      <DashboardQuickLinks />

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--iw-text)]">Project overview</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <PortalLiveDataCard
            projectSlug={bundle.project.slug}
            plan={bundle.project.plan}
            milestoneCount={milestones.length}
            invoiceCount={invoiceCount}
            notificationCount={notifications.length}
            multiProject={multiProject}
          />

          <div className="space-y-4">
            <Card>
              <p className="iw-label mb-2">Phase progress</p>
              <ProgressBar value={bundle.project.progress_pct} />
              <p className="mt-3 text-sm text-[var(--iw-text-2)]">
                Status: <span className="text-[var(--iw-text)]">{bundle.project.status}</span>
              </p>
              <p className="mt-4 iw-label">Recent milestones</p>
              {recent.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--iw-text-3)]">No milestones listed yet.</p>
              ) : (
                <ul className="mt-2 space-y-2 text-sm text-[var(--iw-text)]">
                  {recent.map((m) => (
                    <li
                      key={m.id}
                      className="flex justify-between gap-2 border-b border-[var(--iw-border)] pb-2 last:border-0"
                    >
                      <span>{m.title}</span>
                      <span className="text-[var(--iw-text-3)]">{m.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {pendingAction ? (
              <Card>
                <p className="iw-label mb-1">Needs your attention</p>
                <p className="font-medium text-[var(--iw-text)]">{pendingAction.title}</p>
                <p className="mt-1 text-sm text-[var(--iw-text-2)]">{pendingAction.body}</p>
              </Card>
            ) : (
              <Card>
                <p className="iw-label mb-1">Needs your attention</p>
                <p className="text-sm text-[var(--iw-text-2)]">Nothing pending right now.</p>
              </Card>
            )}
            <PlanSummary plan={bundle.project.plan} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--iw-text)]">Account & engagements</h2>
        <p className="text-sm text-[var(--iw-text-2)]">
          Details we sync for your relationship with us — same information whether you have one project or several.
        </p>
        <HubSpotGate fallback={<HubSpotAccountFallback />}>
          <div className="space-y-6">
            <AccountSummaryCard />
            <EngagementsCard />
          </div>
        </HubSpotGate>
      </section>

      <div className="flex flex-col gap-3 border-t border-[var(--iw-border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--iw-text-2)]">Questions? Message your team anytime.</p>
        <Link href="/messages">
          <Button variant="primary" className="w-full sm:w-auto">
            Send a message
          </Button>
        </Link>
      </div>
    </div>
  )
}
