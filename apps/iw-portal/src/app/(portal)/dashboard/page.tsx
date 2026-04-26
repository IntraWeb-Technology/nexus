import { DashboardQuickLinks } from '@/components/portal/DashboardQuickLinks'
import { PortalLiveDataCard } from '@/components/portal/PortalLiveDataCard'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { PlanSummary } from '@/components/portal/PlanSummary'
import { ProgressBar } from '@/components/portal/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { billingTotals, mergeBillingRows } from '@/lib/billing/types'
import { getPortalBundle } from '@/lib/data/portal'
import { isHubSpotConfigured } from '@/lib/hubspot/config'
import { fetchDeal } from '@/lib/hubspot/client'
import { fetchHubSpotBillingInvoices } from '@/lib/hubspot/invoices'
import { fetchHubSpotDealLineItems } from '@/lib/hubspot/line-items'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { ActivityLogRow, Invoice, Message, Milestone, NotificationRow, OsAutomationLogRow } from '@/lib/supabase/types'
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

function shortDateTime(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return 'Just now'
  return new Date(t).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function cleanActivityDetail(detail: string | null | undefined): string | null {
  if (!detail?.trim()) return null
  const parts = detail
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^proposal:/i.test(part))
  if (parts.length === 0) return null
  return parts.join(' · ')
}

function headingProjectLabel(input: {
  slug: string
  projectName: string | null
  company: string | null
}): string {
  const projectName = input.projectName?.trim()
  if (projectName) return projectName
  const company = input.company?.trim()
  if (input.slug.startsWith('cl-')) {
    return company || 'your project'
  }
  return input.slug.replace(/[-_]+/g, ' ').trim() || company || 'your project'
}

function firstNonEmpty(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const next = value?.trim()
    if (next) return next
  }
  return null
}

/** Turns slug-like values (e.g. `starter`, `growth-tier`) into readable labels. */
function humanizeLabel(input: string | null | undefined): string | null {
  const raw = input?.trim()
  if (!raw) return null
  return raw
    .replace(/[-_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default async function DashboardPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const pid = bundle.project.id
  const multiProject = bundle.projects.length > 1

  const [msRes, invRes, notRes, activityRes, messageRes, automationRes, hubspotInvoices, dealLineItems, dealSheetRes, hubspotDeal] = await Promise.all([
    supabase.from('milestones').select('*').eq('project_id', pid).order('sort_order', { ascending: true }),
    supabase.from('invoices').select('*').eq('project_id', pid),
    supabase.from('notifications').select('*').eq('project_id', pid).order('created_at', { ascending: false }),
    supabase.from('activity_log').select('*').eq('project_id', pid).order('created_at', { ascending: false }).limit(6),
    supabase.from('messages').select('*').eq('project_id', pid).order('created_at', { ascending: false }).limit(4),
    bundle.project.hubspot_deal_id || bundle.client.hubspot_contact_id
      ? supabase
          .from('os_automation_log')
          .select('*')
          .or(
            [
              bundle.project.hubspot_deal_id ? `hubspot_deal_id.eq.${bundle.project.hubspot_deal_id}` : '',
              bundle.client.hubspot_contact_id ? `hubspot_contact_id.eq.${bundle.client.hubspot_contact_id}` : '',
            ]
              .filter(Boolean)
              .join(','),
          )
          .order('logged_at', { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [] }),
    isHubSpotConfigured()
      ? fetchHubSpotBillingInvoices({
          hubspotDealId: bundle.project.hubspot_deal_id,
          hubspotContactId: bundle.client.hubspot_contact_id,
        })
      : Promise.resolve([]),
    isHubSpotConfigured() ? fetchHubSpotDealLineItems(bundle.project.hubspot_deal_id) : Promise.resolve([]),
    bundle.project.hubspot_deal_id
      ? supabase
          .from('os_deals_sheet')
          .select('deal_name,tier')
          .eq('hubspot_deal_id', bundle.project.hubspot_deal_id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    isHubSpotConfigured() && bundle.project.hubspot_deal_id
      ? fetchDeal(bundle.project.hubspot_deal_id, ['dealname', 'tier', 'deal_tier', 'project_tier', 'service_tier'])
          .catch(() => null)
      : Promise.resolve(null),
  ])

  const milestones = (msRes.data ?? []) as Milestone[]
  const supabaseInvoices = (invRes.data ?? []) as Invoice[]
  const notifications = (notRes.data ?? []) as NotificationRow[]
  const activities = (activityRes.data ?? []) as ActivityLogRow[]
  const messages = (messageRes.data ?? []) as Message[]
  const automations = (automationRes.data ?? []) as OsAutomationLogRow[]
  const projectName = firstNonEmpty(
    hubspotDeal?.properties?.dealname,
    dealSheetRes.data?.deal_name,
  )
  const projectTier = firstNonEmpty(
    hubspotDeal?.properties?.tier,
    hubspotDeal?.properties?.deal_tier,
    hubspotDeal?.properties?.project_tier,
    hubspotDeal?.properties?.service_tier,
    dealSheetRes.data?.tier,
  )

  /** Same merged view as Billing — includes CRM-backed invoices, not only portal DB rows. */
  const billingRows = mergeBillingRows(supabaseInvoices, hubspotInvoices)
  const { paid: paidCents, balance: balanceDue } = billingTotals(billingRows)
  const invoiceCount = billingRows.length
  const lineItemTotalCents = dealLineItems.reduce((sum, item) => sum + item.totalAmountCents, 0)
  const displayBalanceDue =
    balanceDue > 0 ? balanceDue : invoiceCount === 0 ? lineItemTotalCents : balanceDue
  const usingLineItemFallback = displayBalanceDue > 0 && invoiceCount === 0 && balanceDue === 0

  const start = bundle.project.start_date ? new Date(bundle.project.start_date) : null
  /* Server component: wall clock for “days since start” — not a pure function by design. */
  const nowMs = new Date().getTime()
  const daysSince = start
    ? Math.max(0, Math.floor((nowMs - start.getTime()) / 86400000))
    : 0

  const pendingAction = notifications.find((n) => n.type === 'action_required' && !n.read)
  const projectLabel = headingProjectLabel({
    slug: bundle.project.slug,
    projectName,
    company: bundle.client.company,
  })
  const tierLabel = projectTier?.trim() || null
  const projectDisplayName = tierLabel ? `${projectLabel} - ${tierLabel}` : projectLabel
  const planDisplay = humanizeLabel(tierLabel) ?? humanizeLabel(bundle.project.plan)

  return (
    <div className="iw-animate-slide-up space-y-8 md:space-y-12">
      <header className="iw-page-header border-b border-[var(--iw-border)] pb-8">
        <div>
          <p className="eyebrow iw-label mb-2">{partOfDay()}, {greetingName(bundle.client.name)}</p>
          <h1>Here&apos;s the latest on {projectDisplayName}</h1>
          <p>
            Live portal data across progress, billing, messages, activity, and anything that needs
            your attention. Updated {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}.
            {multiProject ? ' Use the sidebar to switch projects.' : ''}
          </p>
        </div>
        <Link href="/messages">
          <Button variant="ghost">Message your team</Button>
        </Link>
      </header>

      {pendingAction ? (
        <section className="rounded-[var(--radius-card)] border border-[var(--orange-border)] bg-[var(--orange-soft)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--iw-text)]">{pendingAction.title}</p>
              <p className="mt-1 text-sm text-[var(--iw-text-2)]">{pendingAction.body}</p>
            </div>
            <Link className="iw-chip iw-chip-orange" href="/notifications">
              Review
            </Link>
          </div>
        </section>
      ) : null}

      <div className="iw-enter-stagger grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <div className="iw-card-head">
            <h2 className="iw-card-title">Phase progress</h2>
            <span className="iw-chip iw-chip-teal">{bundle.project.status}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="grid h-28 w-28 place-items-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] text-3xl font-semibold text-[var(--accent-bright)]">
              {bundle.project.progress_pct}%
            </div>
            <div className="flex-1">
              <ProgressBar value={bundle.project.progress_pct} />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="iw-label">Started</p><p>{start ? start.toLocaleDateString() : 'Not set'}</p></div>
                <div><p className="iw-label">Launch</p><p>{bundle.project.estimated_launch || 'Not set'}</p></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <div className="iw-card-head">
            <h2 className="iw-card-title">Live automations</h2>
            <span className="iw-chip">{automations.length}</span>
          </div>
          {automations.length ? (
            <ul className="space-y-2.5">
              {automations.map((event) => (
                <li
                  key={event.id}
                  className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/50 px-3 py-2.5 transition-colors duration-200 hover:border-[var(--iw-border-2)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--iw-text)]">{event.workflow_name}</p>
                    <span className="iw-chip shrink-0">{shortDateTime(event.logged_at)}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--iw-text-3)]">
                    {event.event_type} · {event.status}
                  </p>
                  {event.notes?.trim() ? (
                    <p className="mt-1.5 text-sm text-[var(--iw-text-2)] line-clamp-2">{event.notes}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--iw-text-2)]">No automation events are linked to this project yet.</p>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <div className="iw-card-head">
            <h2 className="iw-card-title">Balance due</h2>
          </div>
          <p className="text-3xl font-semibold tracking-tight">{money(displayBalanceDue)}</p>
          <p className="mt-2 text-sm text-[var(--iw-text-2)]">
            {invoiceCount} invoice rows · {money(paidCents)} paid
          </p>
          {usingLineItemFallback ? (
            <p className="mt-2 text-xs text-[var(--iw-text-3)]">
              No invoice rows yet — showing total from current deal line items.
            </p>
          ) : null}
          <Link href="/billing" className="mt-4 inline-flex">
            <Button variant="ghost">Open billing</Button>
          </Link>
        </Card>

        <Card className="lg:col-span-4">
          <div className="iw-card-head">
            <h2 className="iw-card-title">Recent activity</h2>
            <Link href="/activity" className="iw-chip">Full log</Link>
          </div>
          {activities.length ? (
            <ul className="space-y-3">
              {activities.map((item) => {
                const detail = cleanActivityDetail(item.detail)
                return (
                <li
                  key={item.id}
                  className="rounded-xl border border-[var(--iw-border)] bg-[linear-gradient(180deg,var(--iw-slate-2),var(--iw-slate-3))] px-3.5 py-3 transition-[border-color,box-shadow] duration-200 hover:border-[var(--iw-border-2)] hover:shadow-[var(--iw-shadow-1)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--iw-teal)] shadow-[0_0_0_4px_rgba(25,186,186,0.14)]"
                      />
                      <p className="text-sm font-semibold text-[var(--iw-text)]">{item.label}</p>
                    </div>
                    <span className="iw-chip shrink-0">{shortDateTime(item.created_at)}</span>
                  </div>
                  {detail ? (
                    <p className="mt-2 pl-[18px] text-sm text-[var(--iw-text-2)]">{detail}</p>
                  ) : null}
                </li>
              )})}
            </ul>
          ) : (
            <p className="text-sm text-[var(--iw-text-2)]">No activity has been recorded yet.</p>
          )}
        </Card>

        <Card className="lg:col-span-5">
          <div className="iw-card-head">
            <h2 className="iw-card-title">Latest messages</h2>
            <Link href="/messages" className="iw-chip">Open thread</Link>
          </div>
          {messages.length ? (
            <ul className="space-y-2.5">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/50 px-3 py-2.5 transition-colors duration-200 hover:border-[var(--iw-border-2)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--iw-text)]">{message.sender_name}</p>
                    <span className="iw-chip shrink-0">{shortDateTime(message.created_at)}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--iw-text-2)]">{message.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--iw-text-2)]">No messages yet.</p>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <div className="iw-card-head">
            <h2 className="iw-card-title">Project facts</h2>
          </div>
          <dl className="mt-1 space-y-2.5">
            <div className="rounded-xl border border-[var(--iw-border)] bg-[linear-gradient(180deg,var(--iw-slate-2),var(--iw-slate-3))] px-3.5 py-3 transition-[border-color,box-shadow] duration-200 hover:border-[var(--iw-border-2)] hover:shadow-[var(--iw-shadow-1)]">
              <dt className="iw-label">Days since start</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-[var(--iw-text)]">{daysSince}</dd>
            </div>
            <div className="rounded-xl border border-[var(--iw-border)] bg-[linear-gradient(180deg,var(--iw-slate-2),var(--iw-slate-3))] px-3.5 py-3 transition-[border-color,box-shadow] duration-200 hover:border-[var(--iw-border-2)] hover:shadow-[var(--iw-shadow-1)]">
              <dt className="iw-label">Plan</dt>
              <dd className="mt-1 text-base font-semibold text-[var(--iw-text)]">{planDisplay ?? '—'}</dd>
            </div>
            <div className="rounded-xl border border-[var(--iw-border)] bg-[linear-gradient(180deg,var(--iw-slate-2),var(--iw-slate-3))] px-3.5 py-3 transition-[border-color,box-shadow] duration-200 hover:border-[var(--iw-border-2)] hover:shadow-[var(--iw-shadow-1)]">
              <dt className="iw-label">Deal ID</dt>
              <dd className="iw-mono mt-1 break-all text-sm font-medium text-[var(--iw-text-2)]">
                {bundle.project.hubspot_deal_id ?? '—'}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <DashboardQuickLinks />

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--iw-text)]">Project overview</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--iw-text-2)]">
            Progress, milestones, and anything that needs your review for this project.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <PortalLiveDataCard
            projectName={projectDisplayName}
            tier={projectTier}
            milestoneCount={milestones.length}
            invoiceCount={invoiceCount}
            notificationCount={notifications.length}
            multiProject={multiProject}
          />

          <div className="space-y-4">
            <PlanSummary
              plan={bundle.project.plan}
              includedItems={dealLineItems.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                totalAmountCents: item.totalAmountCents,
              }))}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 border-t border-[var(--iw-border)] pt-8 sm:flex-row sm:items-center sm:justify-between md:pt-10">
        <p className="text-sm text-[var(--iw-text-2)]">Questions? Message your team anytime.</p>
        <Link href="/messages" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            Send a message
          </Button>
        </Link>
      </div>
    </div>
  )
}
