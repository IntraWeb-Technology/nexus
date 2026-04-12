import Link from 'next/link'

function Item({ href, label, sym }: { href: string; label: string; sym: string }) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] text-[var(--iw-text-2)] hover:text-[var(--iw-text)]"
    >
      <span className="text-lg leading-none">{sym}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--iw-border)] bg-[var(--iw-slate-2)] pb-safe md:hidden">
      <Item href="/dashboard" label="Home" sym="◆" />
      <Item href="/messages" label="Messages" sym="✉" />
      <Item href="/notifications" label="Alerts" sym="◇" />
      <Item href="/documents" label="Docs" sym="▤" />
      <Item href="/billing" sym="$" label="Billing" />
    </nav>
  )
}
