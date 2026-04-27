'use client'

import { Button } from '@/components/ui/Button'
import { buildInvoicesCsv, downloadCsvText } from '@/lib/billing/csv'
import type { BillingUiInvoice } from '@/lib/billing/billing-ui-serialize'
import { formatCurrency } from '@/lib/billing/format'
import { useState } from 'react'

export function BillingHeaderActions({
  projectId,
  balanceDueCents,
  payableViaStripeCents,
  currency,
  invoices,
  projectSlug,
}: {
  projectId: string
  balanceDueCents: number
  payableViaStripeCents: number
  currency: string
  invoices: BillingUiInvoice[]
  projectSlug: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const minPay = 50
  const canPayStripe = payableViaStripeCents >= minPay
  const payLabelCents = canPayStripe ? payableViaStripeCents : balanceDueCents

  async function payBalance() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/billing/create-balance-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Could not start checkout')
      if (data.url) window.location.assign(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
      {balanceDueCents !== payableViaStripeCents ? (
        <p className="max-w-sm text-right text-xs text-[var(--iw-text-muted)]">
          Stripe checkout covers {formatCurrency(payableViaStripeCents, currency)}. Use table links for any HubSpot-only
          balance.
        </p>
      ) : null}
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => downloadCsvText(buildInvoicesCsv(invoices), `invoices-${projectSlug}.csv`)}
        >
          Download all
        </Button>
        <div className="w-full sm:w-auto">
          <Button
            type="button"
            variant="primary"
            className="w-full sm:min-w-[10rem]"
            loading={loading}
            disabled={!canPayStripe}
            title={
              !canPayStripe && balanceDueCents > 0
                ? 'Use external pay links in the table for HubSpot-only invoices.'
                : undefined
            }
            onClick={payBalance}
          >
            Pay {formatCurrency(payLabelCents, currency)}
          </Button>
          {error ? (
            <p className="mt-1 text-xs text-[var(--iw-red)]" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
