import { Card } from '@/components/ui/Card'
import { getPortalBundle } from '@/lib/data/portal'
import { getDealPipelineLabelMaps } from '@/lib/hubspot/deals'
import { getHubSpotPortalSnapshot } from '@/lib/hubspot/snapshot'
import {
  formatIsoDate,
  formatLifecycleStage,
  formatUsdFromString,
  truncateText,
} from '@/lib/portal/display'

function row(label: string, value: string | null | undefined) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--iw-border)] py-2 last:border-0">
      <span className="text-[var(--iw-text-3)]">{label}</span>
      <span className="text-right text-[var(--iw-text)]">{value}</span>
    </div>
  )
}

export async function AccountSummaryCard() {
  const bundle = await getPortalBundle()
  if (!bundle) return null

  const dealId = bundle.project.hubspot_deal_id
  const contactId = bundle.client.hubspot_contact_id
  const snap = await getHubSpotPortalSnapshot(dealId, contactId)

  if (snap.ok === false) {
    if (snap.reason === 'no_ids') {
      return (
        <Card>
          <p className="iw-label mb-2">Account details</p>
          <p className="text-sm text-[var(--iw-text-2)]">
            This project has no HubSpot deal or contact id on your portal record yet, so CRM details cannot be
            fetched. Milestones and tasks still come from the portal database only.
          </p>
        </Card>
      )
    }
    if (snap.reason === 'not_configured') {
      return (
        <Card>
          <p className="iw-label mb-2">Account details</p>
          <p className="text-sm text-[var(--iw-text-2)]">
            Account details aren&apos;t available in this environment.
          </p>
        </Card>
      )
    }
    if (snap.reason === 'error') {
      return (
        <Card>
          <p className="iw-label mb-2">Account details</p>
          <p className="text-sm text-[var(--iw-text-2)]">
            We couldn&apos;t load your details right now. Try again later or contact your project lead if this
            continues.
          </p>
        </Card>
      )
    }
    return null
  }

  const maps = await getDealPipelineLabelMaps()
  const d = snap.deal?.properties
  const c = snap.contact?.properties
  const multiProject = bundle.projects.length > 1

  const stageRaw = d?.dealstage != null ? String(d.dealstage) : null
  const stageDisplay = stageRaw ? maps.stageById.get(stageRaw) ?? stageRaw : null
  const pipelineRaw = d?.pipeline != null ? String(d.pipeline) : null
  const pipelineDisplay = pipelineRaw ? maps.pipelineById.get(pipelineRaw) ?? pipelineRaw : null

  return (
    <Card>
      <p className="iw-label mb-2">Account details</p>
      <p className="mb-3 text-sm text-[var(--iw-text-2)]">
        Your engagement and profile information as we have it on file for this portal.
      </p>
      <div className="space-y-4 text-sm">
        {snap.deal ? (
          <div>
            <p className="mb-2 font-medium text-[var(--iw-text)]">
              Engagement{multiProject ? ' (active project)' : ''}
            </p>
            <div>
              {row('Name', d?.dealname ?? null)}
              {row('Pipeline', pipelineDisplay)}
              {row('Stage', stageDisplay)}
              {row('Amount', formatUsdFromString(d?.amount != null ? String(d.amount) : null))}
              {row('Expected close', formatIsoDate(d?.closedate ?? null))}
              {row('Created', formatIsoDate(d?.createdate ?? null))}
              {row('Notes', truncateText(d?.description ?? null, 400))}
            </div>
          </div>
        ) : null}
        {snap.contact ? (
          <div>
            <p className="mb-2 font-medium text-[var(--iw-text)]">Contact profile</p>
            <div>
              {row(
                'Name',
                [c?.firstname, c?.lastname].filter(Boolean).join(' ').trim() || null,
              )}
              {row('Title', c?.jobtitle ?? null)}
              {row('Email', c?.email ?? null)}
              {row('Phone', c?.phone ?? null)}
              {row('Company', c?.company ?? null)}
              {row('Website', c?.website ?? null)}
              {row('Lifecycle', formatLifecycleStage(c?.lifecyclestage ?? null))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
