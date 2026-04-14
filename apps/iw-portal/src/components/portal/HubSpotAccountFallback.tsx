import { Card } from '@/components/ui/Card'

/**
 * Shown when `HubSpotGate` blocks CRM children because no HubSpot bearer token is set on the server
 * (`isHubSpotConfigured()` is false — e.g. missing env on Vercel). Supabase project fixes do not change this.
 */
export function HubSpotAccountFallback() {
  return (
    <Card>
      <p className="iw-label mb-2">Account & engagements</p>
      <div className="space-y-2 text-sm text-[var(--iw-text-2)]">
        <p>
          Live HubSpot deal, contact, and CRM invoice data are not loaded: this deployment has no HubSpot server
          token.
        </p>
        <p className="text-[var(--iw-text-3)]">
          Set <span className="iw-mono text-[var(--iw-text-2)]">HUBSPOT_PRIVATE_APP_TOKEN</span> (recommended) or
          reuse <span className="iw-mono text-[var(--iw-text-2)]">HUBSPOT_ACCESS_TOKEN</span> /{' '}
          <span className="iw-mono text-[var(--iw-text-2)]">HUBSPOT_TOKEN</span> in hosting env. The app needs CRM
          read access to deals, contacts, associations, and (for billing) invoices.
        </p>
      </div>
    </Card>
  )
}
