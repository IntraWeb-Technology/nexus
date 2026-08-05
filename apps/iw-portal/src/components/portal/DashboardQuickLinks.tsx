import Link from 'next/link'

const linkClass =
  'flex min-h-[44px] items-center justify-center rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] px-4 py-3 text-sm font-medium text-[var(--iw-text)] shadow-[var(--iw-shadow-1)] transition-[box-shadow,transform,border-color,color] duration-300 hover:-translate-y-px hover:border-[var(--iw-teal)]/50 hover:text-[var(--iw-teal-light)] hover:shadow-[var(--iw-shadow-2)] active:translate-y-0'

export function DashboardQuickLinks() {
  return (
    <div>
      <p className="iw-label mb-3">Quick links</p>
      <div className="iw-enter-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/progress" className={linkClass}>
          <span className="text-center">Project progress</span>
        </Link>
        <Link href="/billing" className={linkClass}>
          <span className="text-center">Billing</span>
        </Link>
        <Link href="/messages" className={linkClass}>
          <span className="text-center">Messages</span>
        </Link>
        <Link href="/notifications" className={linkClass}>
          <span className="text-center">Notifications</span>
        </Link>
        <Link href="/documents" className={linkClass}>
          <span className="text-center">Documents</span>
        </Link>
      </div>
    </div>
  )
}
