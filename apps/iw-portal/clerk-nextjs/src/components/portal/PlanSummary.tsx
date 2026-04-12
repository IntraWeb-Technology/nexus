import { Card } from '@/components/ui/Card'
import type { Plan } from '@/lib/supabase/types'

export function PlanSummary({ plan }: { plan: Plan }) {
  const title = plan === 'growth' ? 'Growth' : plan === 'starter' ? 'Starter' : 'Custom'
  return (
    <Card>
      <p className="iw-label mb-2">Plan</p>
      <p className="text-[var(--iw-text)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--iw-text-2)]">
        {plan === 'starter'
          ? 'Core automation, client portal, and Vercel deployment — scoped for a focused launch.'
          : plan === 'growth'
            ? 'Everything in Starter plus advanced integrations, AI features, booking, payments, and copywriting.'
            : 'Custom engagement — scope defined in your statement of work.'}
      </p>
    </Card>
  )
}
