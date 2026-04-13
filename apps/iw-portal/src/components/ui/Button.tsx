import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost'

function SpinnerIcon() {
  return (
    <svg
      className="iw-spin -ml-0.5 mr-1.5 h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
  loading?: boolean
}) {
  const base =
    'inline-flex items-center justify-center rounded-[var(--iw-radius-control)] px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-300 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-px active:translate-y-0'
  const styles: Record<Variant, string> = {
    primary:
      'bg-[var(--iw-teal)] text-white border border-[var(--iw-teal)] shadow-[var(--iw-shadow-1)] hover:bg-[var(--iw-teal-light)] hover:border-[var(--iw-teal-light)] hover:shadow-[var(--iw-shadow-2)]',
    ghost:
      'bg-transparent text-[var(--iw-teal-light)] border border-[var(--iw-border-2)] hover:bg-[var(--iw-slate-3)] hover:shadow-[var(--iw-shadow-1)]',
  }
  return (
    <button
      type="button"
      className={`${base} ${styles[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <SpinnerIcon /> : null}
      {children}
    </button>
  )
}
