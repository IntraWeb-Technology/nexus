'use client'

import { Button } from '@/components/ui/Button'
import { useState } from 'react'

export function InvoicePayButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function pay() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Could not start checkout')
      if (data.url) window.location.href = data.url
    } catch (e) {
      if (e instanceof Error && e.message === 'Stripe is not configured') {
        setError('Payments are unavailable for these demo invoices.')
      } else {
        setError(e instanceof Error ? e.message : 'Checkout failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-w-[5rem]">
      <Button variant="primary" className="px-3 py-1 text-xs" disabled={loading} onClick={pay}>
        {loading ? '…' : 'Make a payment'}
      </Button>
      {error ? <p className="mt-1 max-w-[200px] text-xs text-red-400">{error}</p> : null}
    </div>
  )
}
