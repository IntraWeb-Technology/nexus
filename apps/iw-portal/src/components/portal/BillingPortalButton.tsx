'use client'

import { Button } from '@/components/ui/Button'
import { useState } from 'react'

export function BillingPortalButton({
  className = '',
  label = 'Manage payment methods & receipts',
  buttonVariant = 'primary',
}: {
  className?: string
  label?: string
  buttonVariant?: 'primary' | 'outline'
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function openPortal() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/billing/customer-portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) {
        setError(data.error || 'Could not open billing portal')
        return
      }
      if (data.url) window.location.assign(data.url)
      else setError('No redirect URL returned')
    } catch {
      setError('Network error, try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={buttonVariant}
        className="w-full sm:w-auto"
        loading={loading}
        onClick={openPortal}
      >
        {label}
      </Button>
      {error ? (
        <p className="mt-2 text-xs leading-snug text-[var(--iw-red)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
