import { Card } from '@/components/ui/Card'
import type { Plan } from '@/lib/supabase/types'

export type PlanIncludedItem = {
  id: string
  name: string
  quantity: number
  totalAmountCents: number
}

function money(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function PlanSummary({
  plan,
  includedItems,
}: {
  plan: Plan
  includedItems?: PlanIncludedItem[]
}) {
  const title = plan === 'growth' ? 'Growth' : plan === 'starter' ? 'Starter' : 'Custom'
  const hasIncludedItems = Boolean(includedItems?.length)

  return (
    <Card>
      <p className="iw-label mb-2">Your plan</p>
      <p className="text-lg font-semibold text-[var(--iw-text)]">{title}</p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--iw-text-2)]">
        {plan === 'starter'
          ? 'Core automation, client portal, and Vercel deployment — scoped for a focused launch.'
          : plan === 'growth'
            ? 'Everything in Starter plus advanced integrations, AI features, booking, payments, and copywriting.'
            : 'Custom engagement — scope defined in your statement of work.'}
      </p>
      <div className="mt-5 border-t border-[var(--iw-border)] pt-4">
        <p className="iw-label mb-2">What&apos;s included in your plan</p>
        {hasIncludedItems ? (
          <ul className="space-y-2">
            {includedItems?.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/50 px-3 py-2.5 text-sm"
              >
                <span className="text-[var(--iw-text)]">
                  {item.name}
                  {item.quantity > 1 ? (
                    <span className="ml-1 text-[var(--iw-text-3)]">x{item.quantity}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[var(--iw-text-2)]">{money(item.totalAmountCents)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--iw-text-3)]">
            Line items are not available for this engagement yet. Your team can confirm scope details.
          </p>
        )}
      </div>
    </Card>
  )
}
