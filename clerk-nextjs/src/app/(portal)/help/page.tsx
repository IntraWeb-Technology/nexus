import { FaqAccordion } from '@/components/portal/FaqAccordion'
import { Card } from '@/components/ui/Card'

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1>Help & FAQ</h1>
      <FaqAccordion />
      <Card>
        <p className="iw-label mb-2">Contact</p>
        <p className="text-sm text-[var(--iw-text)]">John Schibelli</p>
        <a
          className="mt-1 block text-sm text-[var(--iw-teal-light)] hover:underline"
          href="mailto:john.schibelli@intrawebtech.com"
        >
          john.schibelli@intrawebtech.com
        </a>
        <p className="mt-2 text-sm text-[var(--iw-text-2)]">
          We respond within one business day for most requests.
        </p>
      </Card>
    </div>
  )
}
