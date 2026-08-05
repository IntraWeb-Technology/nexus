'use client'

import { portalNavItems } from '@/components/layout/portal-nav'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export const OPEN_COMMAND_PALETTE_EVENT = 'iw-open-command-palette'

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpen)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpen)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return portalNavItems
    return portalNavItems.filter((item) =>
      `${item.group} ${item.label} ${item.href}`.toLowerCase().includes(normalized),
    )
  }, [query])

  if (!open) return null

  function go(href: string) {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-start bg-black/55 px-4 pt-[10vh] backdrop-blur-md">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--hairline-2)] bg-[var(--bg-2)] shadow-[var(--iw-shadow-3)]">
        <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-[var(--iw-text-3)]">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search routes and actions..."
            className="flex-1 bg-transparent text-sm text-[var(--iw-text)] outline-none placeholder:text-[var(--iw-text-3)]"
          />
          <kbd className="rounded border border-[var(--hairline)] bg-[var(--bg-3)] px-1.5 py-0.5 text-[10px] text-[var(--iw-text-3)]">
            Esc
          </kbd>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-2">
          {results.length ? (
            results.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => go(item.href)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-2)]"
              >
                <span>
                  <span className="block font-medium text-[var(--iw-text)]">{item.label}</span>
                  <span className="text-xs text-[var(--iw-text-3)]">{item.group}</span>
                </span>
                <span className="iw-mono text-xs text-[var(--iw-text-3)]">{item.href}</span>
              </button>
            ))
          ) : (
            <div className="p-6 text-sm text-[var(--iw-text-2)]">
              No matching routes. Only live app routes are shown here.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
