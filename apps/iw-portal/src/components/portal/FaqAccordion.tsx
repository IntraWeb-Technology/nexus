'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'How long does the build phase take?',
    a: 'Typically 10–14 business days depending on how quickly content and approvals come back.',
  },
  {
    q: 'When is my balance due?',
    a: 'Your go-live balance and first retainer are due at launch (Starter example: $1,500 balance + $300 first retainer).',
  },
  {
    q: 'What does the retainer cover?',
    a: 'Starter retainer at $300/mo includes lead sourcing, outreach, invoice reminders, and reporting — scoped in your agreement.',
  },
  {
    q: 'Can I upgrade from Starter to Growth?',
    a: 'Yes — at any time. Growth is $4,000 setup and $450/mo; work completed to date carries forward.',
  },
  {
    q: 'How do I provide content and assets?',
    a: 'Use the Messages tab in this portal or email john.schibelli@intrawebtech.com.',
  },
  {
    q: 'What happens after launch?',
    a: 'We move into the retainer phase with monthly reporting; ongoing changes are coordinated through this portal.',
  },
]

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="space-y-2">
      {faqs.map((f, i) => (
        <div key={f.q} className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)]">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--iw-text)]"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {f.q}
            <span className="text-[var(--iw-text-3)]">{open === i ? '−' : '+'}</span>
          </button>
          {open === i ? (
            <div className="border-t border-[var(--iw-border)] px-4 py-3 text-sm text-[var(--iw-text-2)]">
              {f.a}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
