'use client'

import type { InputHTMLAttributes } from 'react'

export function Toggle({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border border-[var(--iw-border-2)] bg-[var(--iw-slate-3)] text-[var(--iw-teal)] accent-[var(--iw-teal)]"
        {...props}
      />
      <span className="text-sm text-[var(--iw-text)]">{label}</span>
    </label>
  )
}
