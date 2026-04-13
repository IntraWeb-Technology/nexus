'use client'

import type { InputHTMLAttributes } from 'react'

export function Toggle({
  label,
  description,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      {/* Hidden real checkbox + visible pill */}
      <span className="relative mt-0.5 flex shrink-0 items-center">
        <input type="checkbox" className="peer sr-only" {...props} />
        {/* Track */}
        <span className="block h-5 w-9 rounded-full border border-[var(--iw-border-2)] bg-[var(--iw-slate-2)] transition-[background-color,border-color] duration-200 peer-checked:border-[var(--iw-teal-dim)] peer-checked:bg-[var(--iw-teal-dim)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--iw-teal)]" />
        {/* Knob */}
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[var(--iw-text-3)] shadow-sm transition-[transform,background-color] duration-200 peer-checked:translate-x-4 peer-checked:bg-[var(--iw-teal-light)]" />
      </span>
      <span>
        <span className="text-sm font-medium text-[var(--iw-text)]">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-[var(--iw-text-3)]">{description}</span>
        ) : null}
      </span>
    </label>
  )
}
