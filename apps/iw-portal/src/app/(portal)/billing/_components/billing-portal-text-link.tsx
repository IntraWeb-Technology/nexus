'use client'

import { useState } from 'react'

export function BillingPortalTextLink({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/customer-portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string }
      if (res.ok && data.url) window.location.assign(data.url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={loading}
      className="text-sm font-medium text-[#14b8a6] transition-colors hover:text-[var(--accent-bright)] disabled:opacity-50"
    >
      {loading ? 'Opening…' : children}
    </button>
  )
}
