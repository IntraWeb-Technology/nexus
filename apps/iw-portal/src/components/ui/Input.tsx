import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-[var(--iw-border-2)] bg-[var(--iw-slate-3)] px-3 py-2 text-sm text-[var(--iw-text)] placeholder:text-[var(--iw-text-3)] outline-none focus:border-[var(--iw-teal)] focus-visible:ring-2 focus-visible:ring-[var(--iw-teal)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--iw-slate-3)] ${className}`}
      {...props}
    />
  )
}
