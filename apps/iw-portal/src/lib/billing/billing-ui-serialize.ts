import type { BillingInvoiceRow } from '@/lib/billing/types'
import type { BillingKind, BillingPhase, InvoiceStatus, SubscriptionRow } from '@/lib/supabase/types'

/** Serializable row for billing UI (client + server). */
export type BillingUiInvoice = {
  id: string
  supabaseInvoiceId: string | null
  invoiceNumber: string
  description: string
  status: InvoiceStatus
  issuedAt: string
  dueAt: string | null
  amountCents: number
  currency: string
  payUrl: string | null
  hubspotDealId: string | null
  billingPhase: BillingPhase | null
  billingKind: BillingKind
  milestoneOrder: 1 | 2 | 3 | null
  servicePeriodStart: string | null
  servicePeriodEnd: string | null
  maintenanceGroupKey: string | null
}

function dueToIso(due: string | null): string | null {
  if (!due?.trim()) return null
  const d = new Date(due.length <= 10 ? `${due}T12:00:00` : due)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function billingRowsToUiInvoices(rows: BillingInvoiceRow[]): BillingUiInvoice[] {
  const mapped: BillingUiInvoice[] = rows.map((r) => {
    if (r.source === 'supabase') {
      const inv = r.invoice
      return {
        id: inv.id,
        supabaseInvoiceId: inv.id,
        invoiceNumber: inv.invoice_number,
        description: inv.description || 'Service invoice',
        status: inv.status,
        issuedAt: inv.created_at,
        dueAt: dueToIso(inv.due_date),
        amountCents: inv.amount_cents,
        currency: (inv.currency || 'usd').toLowerCase(),
        payUrl: null,
        hubspotDealId: null,
        billingPhase: inv.billing_phase ?? null,
        billingKind: inv.billing_kind ?? 'project_milestone',
        milestoneOrder: inv.milestone_order ?? null,
        servicePeriodStart: dueToIso(inv.service_period_start ?? null),
        servicePeriodEnd: dueToIso(inv.service_period_end ?? null),
        maintenanceGroupKey: inv.maintenance_group_key ?? null,
      }
    }
    return {
      id: `hs-${r.hubspotId}`,
      supabaseInvoiceId: null,
      invoiceNumber: r.invoice_number,
      description: r.description || 'Service invoice',
      status: r.status,
      issuedAt: r.created_at,
      dueAt: dueToIso(r.due_date),
      amountCents: r.amount_cents,
      currency: r.currency && r.currency.length === 3 ? r.currency : 'usd',
      payUrl: r.payUrl,
      hubspotDealId: null,
      billingPhase: r.billing_phase ?? null,
      billingKind: r.billing_kind ?? 'project_milestone',
      milestoneOrder: r.milestone_order ?? null,
      servicePeriodStart: dueToIso(r.service_period_start ?? null),
      servicePeriodEnd: dueToIso(r.service_period_end ?? null),
      maintenanceGroupKey: r.maintenance_group_key ?? null,
    }
  })

  mapped.sort((a, b) => {
    const da = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY
    const db = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY
    if (da !== db) return da - db
    return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  })
  return mapped
}

export type BillingTimelineCard = {
  phase: Exclude<BillingPhase, 'maintenance'>
  order: 1 | 2 | 3
  title: string
  subtitle: string
  invoice: BillingUiInvoice | null
  status: 'paid' | 'open' | 'upcoming'
}

export type MaintenanceSummaryCard = {
  latest: BillingUiInvoice | null
  nextDueAt: string | null
  totalOpenCents: number
  openCount: number
  subscriptionStatus: SubscriptionRow['status'] | null
  subscriptionPeriodEnd: string | null
}

export type BillingTimelineModel = {
  phaseCards: BillingTimelineCard[]
  maintenanceSummary: MaintenanceSummaryCard
  maintenanceHistory: BillingUiInvoice[]
  invoiceHistory: BillingUiInvoice[]
}

function phaseRank(phase: Exclude<BillingPhase, 'maintenance'>) {
  return phase === 'deposit' ? 1 : phase === 'build_qa' ? 2 : 3
}

function phaseTitle(phase: Exclude<BillingPhase, 'maintenance'>): string {
  if (phase === 'deposit') return 'Phase 1: Deposit'
  if (phase === 'build_qa') return 'Phase 2: Build + QA'
  return 'Phase 3: Handoff'
}

function phaseSubtitle(phase: Exclude<BillingPhase, 'maintenance'>): string {
  if (phase === 'deposit') return 'Project kickoff payment'
  if (phase === 'build_qa') return 'Build and quality assurance milestone'
  return 'Final handoff and launch completion'
}

export function buildBillingTimelineModel(
  invoices: BillingUiInvoice[],
  subscription: SubscriptionRow | null = null,
): BillingTimelineModel {
  const milestoneInvoices = invoices.filter(
    (row) => row.billingKind === 'project_milestone' && row.billingPhase !== 'maintenance',
  )
  const maintenanceHistory = [...invoices.filter((row) => row.billingKind === 'recurring_maintenance')].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
  )

  const phaseOrder: Array<Exclude<BillingPhase, 'maintenance'>> = ['deposit', 'build_qa', 'handoff']
  const phaseCards: BillingTimelineCard[] = phaseOrder.map((phase) => {
    const matching = milestoneInvoices
      .filter((row) => row.billingPhase === phase)
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    const invoice = matching[0] ?? null
    const status: BillingTimelineCard['status'] = !invoice
      ? 'upcoming'
      : invoice.status === 'paid'
        ? 'paid'
        : 'open'
    return {
      phase,
      order: phaseRank(phase) as 1 | 2 | 3,
      title: phaseTitle(phase),
      subtitle: phaseSubtitle(phase),
      invoice,
      status,
    }
  })

  const latest = maintenanceHistory[0] ?? null
  let nextDueAt: string | null = null
  let openCount = 0
  let totalOpenCents = 0
  for (const row of maintenanceHistory) {
    if (row.status !== 'pending' && row.status !== 'overdue') continue
    openCount += 1
    totalOpenCents += row.amountCents
    if (!nextDueAt) {
      nextDueAt = row.dueAt
    } else if (row.dueAt) {
      const candidate = new Date(row.dueAt).getTime()
      const current = new Date(nextDueAt).getTime()
      if (!Number.isNaN(candidate) && candidate < current) nextDueAt = row.dueAt
    }
  }

  return {
    phaseCards,
    maintenanceSummary: {
      latest,
      nextDueAt: nextDueAt ?? subscription?.current_period_end ?? null,
      totalOpenCents,
      openCount,
      subscriptionStatus: subscription?.status ?? null,
      subscriptionPeriodEnd: subscription?.current_period_end ?? null,
    },
    maintenanceHistory,
    invoiceHistory: invoices,
  }
}

export type BillingMetrics = {
  balanceDueCents: number
  payableViaStripeCents: number
  paidThisYearCents: number
  paidThisYearInvoiceCount: number
  totalInvoicedCents: number
  nextPaymentDueAt: string | null
  openCount: number
  paidCount: number
  overdueCount: number
  dueSoonCount: number
  draftCount: number
  /** Open invoices with due date within 7 days (future) or missing due date */
  alertOpenCount: number
  alertTotalCents: number
  hasOverdue: boolean
  hasDueSoon: boolean
}

const OPEN: InvoiceStatus[] = ['pending', 'overdue']

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

export function computeBillingMetrics(
  invoices: BillingUiInvoice[],
  now = new Date(),
): BillingMetrics {
  const year = now.getFullYear()
  const t0 = startOfDay(now)
  const weekAheadMs = 7 * 86400000

  let balanceDueCents = 0
  let payableViaStripeCents = 0
  let paidThisYearCents = 0
  let paidThisYearInvoiceCount = 0
  let totalInvoicedCents = 0
  let openCount = 0
  let paidCount = 0
  let overdueCount = 0
  let dueSoonCount = 0
  let draftCount = 0
  let nextPaymentDueAt: string | null = null
  let nextDueMs = Number.POSITIVE_INFINITY

  for (const inv of invoices) {
    totalInvoicedCents += inv.amountCents
    if (inv.status === 'void') {
      draftCount++
      continue
    }
    if (inv.status === 'paid') {
      paidCount++
      const issued = new Date(inv.issuedAt)
      if (issued.getFullYear() === year) {
        paidThisYearCents += inv.amountCents
        paidThisYearInvoiceCount++
      }
      continue
    }
    if (OPEN.includes(inv.status)) {
      openCount++
      balanceDueCents += inv.amountCents
      if (inv.supabaseInvoiceId) payableViaStripeCents += inv.amountCents
      if (inv.status === 'overdue') overdueCount++

      if (inv.dueAt) {
        const dueT = new Date(inv.dueAt).getTime()
        if (dueT < nextDueMs) {
          nextDueMs = dueT
          nextPaymentDueAt = inv.dueAt
        }
      }

      if (inv.status === 'overdue') continue
      if (inv.dueAt) {
        const dueStart = startOfDay(new Date(inv.dueAt))
        if (dueStart >= t0 && dueStart - t0 <= weekAheadMs) dueSoonCount++
      }
    }
  }

  const hasOverdue = overdueCount > 0
  const hasDueSoon = dueSoonCount > 0 && !hasOverdue
  const alertOpenCount = openCount
  const alertTotalCents = balanceDueCents

  return {
    balanceDueCents,
    payableViaStripeCents,
    paidThisYearCents,
    paidThisYearInvoiceCount,
    totalInvoicedCents,
    nextPaymentDueAt,
    openCount,
    paidCount,
    overdueCount,
    dueSoonCount,
    draftCount,
    alertOpenCount,
    alertTotalCents,
    hasOverdue,
    hasDueSoon,
  }
}
