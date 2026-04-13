import { Card } from '@/components/ui/Card'

export function HubSpotAccountFallback() {
  return (
    <Card>
      <p className="iw-label mb-2">Account & engagements</p>
      <p className="text-sm text-[var(--iw-text-2)]">
        Synced account and engagement details aren&apos;t available in this environment.
      </p>
    </Card>
  )
}
