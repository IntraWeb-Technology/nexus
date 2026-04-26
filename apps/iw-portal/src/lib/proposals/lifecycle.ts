import type { OsContractsQueueRow } from '@/lib/supabase/types'

export type ProposalLifecycleEventType = 'viewed' | 'approved' | 'rejected'
export type ProposalTerminalStatus = 'Approved' | 'Rejected'

export const PROPOSAL_PENDING_STATUS = 'Pending Review'

export function normalizeProposalStatus(status: string | null | undefined): string {
  return (status ?? '').trim() || PROPOSAL_PENDING_STATUS
}

export function isProposalTerminalStatus(status: string | null | undefined): boolean {
  const normalized = normalizeProposalStatus(status).toLowerCase()
  return normalized === 'approved' || normalized === 'rejected'
}

export function proposalStatusForEvent(eventType: ProposalLifecycleEventType): ProposalTerminalStatus | null {
  if (eventType === 'approved') return 'Approved'
  if (eventType === 'rejected') return 'Rejected'
  return null
}

export function assertValidProposalTransition(
  proposal: Pick<OsContractsQueueRow, 'status'>,
  eventType: ProposalLifecycleEventType,
): { ok: true } | { ok: false; status: number; error: string } {
  if (eventType === 'viewed') return { ok: true }
  if (isProposalTerminalStatus(proposal.status)) {
    return { ok: false, status: 409, error: `Proposal already ${normalizeProposalStatus(proposal.status).toLowerCase()}` }
  }
  if (normalizeProposalStatus(proposal.status) !== PROPOSAL_PENDING_STATUS) {
    return { ok: false, status: 409, error: 'Proposal is not pending review' }
  }
  return { ok: true }
}

export function proposalDisplayName(
  proposal: Pick<OsContractsQueueRow, 'client_name' | 'company'> & { hubspot_deal_id?: string | null },
): string {
  return proposal.client_name?.trim() || proposal.company?.trim() || `Deal ${proposal.hubspot_deal_id ?? 'proposal'}`
}

export function proposalEventLabel(eventType: ProposalLifecycleEventType): string {
  if (eventType === 'approved') return 'Proposal approved'
  if (eventType === 'rejected') return 'Proposal rejected'
  return 'Proposal viewed'
}

export function proposalEventDetail(input: {
  proposal: Pick<OsContractsQueueRow, 'id' | 'client_name' | 'company' | 'deal_value'>
  actorName: string
  note?: string | null
}): string {
  const parts = [
    `proposal:${input.proposal.id}`,
    proposalDisplayName(input.proposal),
    input.proposal.deal_value ? `value ${input.proposal.deal_value}` : '',
    `by ${input.actorName}`,
    input.note ? `note: ${input.note}` : '',
  ].filter(Boolean)
  return parts.join(' · ')
}
