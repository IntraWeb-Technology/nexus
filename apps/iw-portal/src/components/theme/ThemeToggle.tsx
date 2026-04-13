'use client'

import { useTheme } from '@/contexts/theme-context'

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 9.5A6 6 0 1 1 6.5 2.5a4.5 4.5 0 0 0 7 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-[var(--iw-radius-control)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)]/60 text-[var(--iw-text-2)] transition-[border-color,background-color,color,transform] duration-200 hover:border-[var(--iw-border-2)] hover:bg-[var(--iw-slate-3)] hover:text-[var(--iw-text)] active:scale-95"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      suppressHydrationWarning
    >
      <span className="transition-transform duration-300" suppressHydrationWarning>
        {isLight ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  )
}
