import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`iw-card transition-[box-shadow,transform,border-color] duration-300 hover:shadow-[var(--iw-shadow-2)] ${className}`}>{children}</div>
}
