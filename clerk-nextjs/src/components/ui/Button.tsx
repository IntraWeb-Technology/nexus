import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost'

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'
  const styles: Record<Variant, string> = {
    primary: 'bg-[var(--iw-teal)] text-white border border-[var(--iw-teal)]',
    ghost:
      'bg-transparent text-[var(--iw-teal-light)] border border-[var(--iw-border-2)] hover:bg-[var(--iw-slate-3)]',
  }
  return (
    <button type="button" className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
