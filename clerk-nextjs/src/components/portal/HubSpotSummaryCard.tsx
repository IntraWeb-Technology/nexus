import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import { getHubSpotPortalSnapshot } from '@/lib/hubspot/snapshot'

function row(label: string, value: string | null | undefined) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--iw-border)] py-2 last:border-0">
      <span className="text-[var(--iw-text-3)]">{label}</span>
      <span className="text-right text-[var(--iw-text)]">{value}</span>
    </div>
  )
}

export async function HubSpotSummaryCard() {
  const bundle = await getPortalBundle()
  if (!bundle) return null

  const dealId = bundle.project.hubspot_deal_id
  const contactId = bundle.client.hubspot_contact_id
  const snap = await getHubSpotPortalSnapshot(dealId, contactId)

  if (snap.ok === false) {
    if (snap.reason === 'no_ids') {
      return (
        <Card>
          <p className="iw-label mb-2">HubSpot</p>
          <p className="text-sm text-[var(--iw-text-2)]">
            Link a HubSpot contact and deal to this project to show live CRM fields here (IDs are set during
            provisioning).
          </p>
        </Card>
      )
    }
    if (snap.reason === 'not_configured') {
      return (
        <Card>
          <p className="iw-label mb-2">HubSpot</p>
          <p className="text-sm text-[var(--iw-text-2)]">CRM integration is not configured for this environment.</p>
        </Card>
      )
    }
    if (snap.reason === 'error') {
      return (
        <Card>
          <p className="iw-label mb-2">HubSpot</p>
          <p className="text-sm text-[var(--iw-text-2)]">{snap.message}</p>
        </Card>
      )
    }
    return null
  }

  const d = snap.deal?.properties
  const c = snap.contact?.properties

  return (
    <Card>
      <p className="iw-label mb-2">HubSpot</p>
      <div className="space-y-4 text-sm">
        {snap.deal ? (
          <div>
            <p className="mb-2 font-medium text-[var(--iw-text)]">Deal</p>
            <div>
              {row('Name', d?.dealname ?? null)}
              {row('Stage', d?.dealstage ?? null)}
              {row('Amount', d?.amount != null ? String(d.amount) : null)}
              {row('Close date', d?.closedate ?? null)}
            </div>
          </div>
        ) : null}
        {snap.contact ? (
          <div>
            <p className="mb-2 font-medium text-[var(--iw-text)]">Contact</p>
            <div>
              {row(
                'Name',
                [c?.firstname, c?.lastname].filter(Boolean).join(' ').trim() || null,
              )}
              {row('Email', c?.email ?? null)}
              {row('Phone', c?.phone ?? null)}
              {row('Company', c?.company ?? null)}
              {row('Lifecycle', c?.lifecyclestage ?? null)}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
