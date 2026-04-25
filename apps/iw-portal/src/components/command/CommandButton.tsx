'use client'

import { openCommandPalette } from '@/components/command/CommandPalette'

export function CommandButton() {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className="hidden min-w-0 max-w-[360px] flex-1 items-center gap-2 rounded-[var(--radius-ctrl)] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1.5 text-left text-xs text-[var(--iw-text-3)] transition-colors hover:border-[var(--hairline-2)] hover:text-[var(--iw-text)] lg:flex"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span className="truncate">Search, jump, act...</span>
      <kbd className="ml-auto rounded border border-[var(--hairline)] bg-[var(--bg-3)] px-1.5 py-0.5 text-[10px]">
        Ctrl K
      </kbd>
    </button>
  )
}
