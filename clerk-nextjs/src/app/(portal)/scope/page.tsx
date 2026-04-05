import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'

export default async function ScopePage() {
  const bundle = await getPortalBundle()
  if (!bundle) return <PortalDataUnavailable />
  const plan = bundle.project.plan

  return (
    <div className="space-y-6">
      <h1>Scope of Work</h1>
      <Card>
        <p className="iw-label mb-2">Engagement</p>
        <p className="text-sm text-[var(--iw-text-2)]">
          This page summarizes what is included for your selected plan. Your executed agreement and
          statement of work remain the legal source of truth.
        </p>
      </Card>
      {plan === 'growth' ? (
        <Card>
          <p className="iw-label mb-2">Growth — deliverables</p>
          <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
            <li>All Starter deliverables (core site, forms, lead intake automation, Vercel deployment)</li>
            <li>Advanced integrations with your stack</li>
            <li>AI-assisted features and configuration</li>
            <li>Booking and payments flows</li>
            <li>Copywriting included for agreed pages</li>
          </ul>
        </Card>
      ) : (
        <Card>
          <p className="iw-label mb-2">Starter — deliverables</p>
          <ul className="list-inside list-disc space-y-2 text-sm text-[var(--iw-text-2)]">
            <li>Up to five pages and supporting layouts</li>
            <li>Contact forms and lead intake automation</li>
            <li>Vercel deployment and go-live support</li>
          </ul>
        </Card>
      )}
      <Card>
        <p className="iw-label mb-2">Exclusions</p>
        <p className="text-sm text-[var(--iw-text-2)]">
          Third-party subscription costs, ad spend, photography outside agreed scope, and bespoke
          software not listed in your SOW are excluded unless added by change order.
        </p>
      </Card>
    </div>
  )
}
