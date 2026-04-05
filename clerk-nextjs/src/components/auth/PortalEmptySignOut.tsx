'use client'

import { SignOutButton } from '@clerk/nextjs'

export function PortalEmptySignOut() {
  return (
    <SignOutButton>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-[var(--iw-border-2)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--iw-teal-light)] transition-colors hover:bg-[var(--iw-slate-3)]"
      >
        Sign out
      </button>
    </SignOutButton>
  )
}
