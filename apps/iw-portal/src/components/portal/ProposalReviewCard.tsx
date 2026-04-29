'use client'

import { Button } from '@/components/ui/Button'
import {
  isProposalTerminalStatus,
  proposalDisplayName,
  type ProposalLifecycleEventType,
} from '@/lib/proposals/lifecycle'
import { formatUsdFromString } from '@/lib/portal/display'
import type { OsContractsQueueRow } from '@/lib/supabase/types'
import { useCallback, useMemo, useState } from 'react'

type ProposalReviewCardProps = {
  initialProposals: OsContractsQueueRow[]
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Not available'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return 'Not available'
  return new Date(t).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function statusTone(status: string): string {
  const normalized = status.toLowerCase()
  if (normalized === 'approved') return 'iw-chip iw-chip-green'
  if (normalized === 'rejected') return 'iw-chip iw-chip-orange'
  return 'iw-chip iw-chip-teal'
}

function dealValueLabel(value: string | null): string {
  const formatted = formatUsdFromString(value)
  return formatted || value?.trim() || 'Not set'
}

export function ProposalReviewCard({ initialProposals }: ProposalReviewCardProps) {
  const [proposals, setProposals] = useState(initialProposals)
  const [activeAction, setActiveAction] = useState<{
    proposalId: string
    eventType: ProposalLifecycleEventType
  } | null>(null)
  const [note, setNote] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const latestProposal = useMemo(() => proposals[0] ?? null, [proposals])

  const portalProposalHref = useMemo(() => {
    if (!latestProposal) return null
    if (latestProposal.proposal_document_id) {
      return `/api/documents/download?id=${encodeURIComponent(latestProposal.proposal_document_id)}`
    }
    if (latestProposal.pdf_storage_path) {
      return `/api/os-queue/pdf?id=${encodeURIComponent(latestProposal.id)}`
    }
    return null
  }, [latestProposal])

  const submitEvent = useCallback(
    async (proposalId: string, eventType: ProposalLifecycleEventType, noteValue?: string) => {
      setBusyId(`${proposalId}:${eventType}`)
      setError(null)
      try {
        const res = await fetch('/api/proposals/decision', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            proposalId,
            eventType,
            note: noteValue?.trim() || undefined,
          }),
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          setError(body?.error ?? 'Could not update proposal.')
          return
        }
        const body = (await res.json()) as { proposal?: OsContractsQueueRow }
        const updated = body.proposal
        if (updated) {
          setProposals((rows) => rows.map((row) => (row.id === updated.id ? updated : row)))
        }
        setActiveAction(null)
        setNote('')
      } catch {
        setError('Could not update proposal.')
      } finally {
        setBusyId(null)
      }
    },
    [],
  )

  if (!latestProposal) {
    return (
      <div className="iw-card">
        <p className="iw-label mb-2">Proposal review</p>
        <p className="text-sm text-[var(--iw-text-2)]">
          No proposal has been published to your portal for this project yet.
        </p>
      </div>
    )
  }

  const label = proposalDisplayName(latestProposal)
  const actionable = !isProposalTerminalStatus(latestProposal.status)

  return (
    <div className="iw-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="iw-label mb-2">Proposal review</p>
          <h2 className="text-lg font-semibold text-[var(--iw-text)]">{label}</h2>
          <p className="mt-1 text-sm text-[var(--iw-text-2)]">
            Review the active proposal and approve or reject it from inside the portal.
          </p>
        </div>
        <span className={statusTone(latestProposal.status)}>{latestProposal.status}</span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/50 p-3">
          <dt className="iw-label">Value</dt>
          <dd className="mt-1 text-[var(--iw-text)]">{dealValueLabel(latestProposal.deal_value)}</dd>
        </div>
        <div className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/50 p-3">
          <dt className="iw-label">Tier</dt>
          <dd className="mt-1 text-[var(--iw-text)]">{latestProposal.tier || 'Not set'}</dd>
        </div>
        <div className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/50 p-3">
          <dt className="iw-label">Updated</dt>
          <dd className="mt-1 text-[var(--iw-text)]">{formatDate(latestProposal.updated_at)}</dd>
        </div>
      </dl>

      {latestProposal.proposal_status_detail ? (
        <p className="mt-4 rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/40 p-3 text-sm text-[var(--iw-text-2)]">
          {latestProposal.proposal_status_detail}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-[var(--iw-red)]">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {portalProposalHref || latestProposal.drive_link ? (
          <a
            href={portalProposalHref ?? latestProposal.drive_link!}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-[var(--iw-radius-control)] border border-[var(--hairline-2)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--accent-bright)] transition-[background-color,border-color,color,box-shadow,transform] duration-300 hover:-translate-y-px hover:bg-[var(--surface-2)] hover:shadow-[var(--iw-shadow-1)]"
            onClick={() => void submitEvent(latestProposal.id, 'viewed')}
          >
            Open proposal
          </a>
        ) : null}
        {portalProposalHref && latestProposal.drive_link ? (
          <a
            href={latestProposal.drive_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-[var(--iw-radius-control)] border border-[var(--iw-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--iw-text-2)] transition-colors hover:text-[var(--iw-teal)]"
          >
            Open in Google Drive
          </a>
        ) : null}
        {actionable ? (
          <>
            <Button
              type="button"
              variant="primary"
              loading={busyId === `${latestProposal.id}:approved`}
              onClick={() => void submitEvent(latestProposal.id, 'approved')}
            >
              Approve proposal
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={Boolean(busyId)}
              onClick={() => {
                setError(null)
                setActiveAction({ proposalId: latestProposal.id, eventType: 'rejected' })
              }}
            >
              Reject proposal
            </Button>
          </>
        ) : null}
      </div>

      {activeAction?.proposalId === latestProposal.id && activeAction.eventType === 'rejected' ? (
        <div className="mt-4 rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/40 p-3">
          <label className="text-sm font-medium text-[var(--iw-text)]" htmlFor="proposal-reject-note">
            Add rejection feedback
          </label>
          <textarea
            id="proposal-reject-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-3 py-2 text-sm text-[var(--iw-text)]"
            placeholder="Tell us what needs to change."
            disabled={Boolean(busyId)}
          />
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="primary"
              loading={busyId === `${latestProposal.id}:rejected`}
              onClick={() => void submitEvent(latestProposal.id, 'rejected', note)}
            >
              Confirm rejection
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={Boolean(busyId)}
              onClick={() => {
                setActiveAction(null)
                setNote('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
