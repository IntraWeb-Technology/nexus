'use client'

import { Button } from '@/components/ui/Button'
import { changeOrderLegalCopy } from '@/lib/change-order/changeOrderCopy'
import type { ChangeOrderCostImpactType } from '@/lib/change-order/schema'
import type { ChangeOrderRow } from '@/lib/supabase/types'
import { useCallback, useState } from 'react'

const inputCls =
  'mt-1.5 w-full rounded-[var(--iw-radius-control)] border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-3 py-2 text-sm text-[var(--iw-text)] placeholder:text-[var(--iw-text-3)] transition-[border-color] duration-200 focus:border-[var(--iw-teal)] focus:outline-none disabled:opacity-50'
const labelCls = 'block text-sm font-medium text-[var(--iw-text-2)]'
const areaCls = `${inputCls} min-h-[100px] resize-y leading-relaxed`

type Step = 0 | 1 | 2 | 3

const STEP_LABELS = ['Request', 'Scope', 'Budget', 'Confirm']

const costOptions: { value: ChangeOrderCostImpactType; label: string }[] = [
  { value: 'none', label: 'No change to fees' },
  { value: 'increase', label: 'Fee increase expected' },
  { value: 'decrease', label: 'Fee decrease / removal' },
  { value: 'tbd', label: 'To be determined after estimate' },
]

function StepIndicator({ step }: { step: number }) {
  return (
    <nav
      aria-label="Form steps"
      className="mb-6"
    >
      <ol className="flex items-center" role="list">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span
                aria-current={i === step ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${label}${i < step ? ' — completed' : i === step ? ' — current' : ''}`}
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-[background-color,border-color,color] duration-200',
                  i < step
                    ? 'bg-[var(--iw-teal)] text-white'
                    : i === step
                      ? 'border-2 border-[var(--iw-teal)] text-[var(--iw-teal)]'
                      : 'border border-[var(--iw-border-2)] text-[var(--iw-text-3)]',
                ].join(' ')}
              >
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span aria-hidden="true">{i + 1}</span>
                )}
              </span>
              <span
                aria-hidden="true"
                className={`mt-1 hidden text-[10px] font-medium sm:block ${i === step ? 'text-[var(--iw-teal)]' : 'text-[var(--iw-text-3)]'}`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                aria-hidden="true"
                className={`mx-2 h-px flex-1 transition-[background-color] duration-300 ${i < step ? 'bg-[var(--iw-teal)]' : 'bg-[var(--iw-border)]'}`}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function ChangeOrderForm({
  onCreated,
  onClose,
}: {
  onCreated: (row: ChangeOrderRow) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>(0)
  const [title, setTitle] = useState('')
  const [masterAgreementReference, setMasterAgreementReference] = useState('')
  const [currentScopeSummary, setCurrentScopeSummary] = useState('')
  const [requestedScopeDetail, setRequestedScopeDetail] = useState('')
  const [businessRationale, setBusinessRationale] = useState('')
  const [scheduleImpact, setScheduleImpact] = useState('')
  const [costImpactType, setCostImpactType] = useState<ChangeOrderCostImpactType>('tbd')
  const [costImpactDescription, setCostImpactDescription] = useState('')
  const [proposedEffectiveDate, setProposedEffectiveDate] = useState('')
  const [authorizedSignerName, setAuthorizedSignerName] = useState('')
  const [authorizedSignerTitle, setAuthorizedSignerTitle] = useState('')
  const [ackAccuracy, setAckAccuracy] = useState(false)
  const [ackAuthority, setAckAuthority] = useState(false)
  const [ackWrittenSupersedesVerbal, setAckWrittenSupersedesVerbal] = useState(false)
  const [ackElectronicRecords, setAckElectronicRecords] = useState(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canNext0 = title.trim().length > 0 && masterAgreementReference.trim().length > 0
  const canNext1 =
    currentScopeSummary.trim().length > 0 &&
    requestedScopeDetail.trim().length > 0 &&
    businessRationale.trim().length > 0
  const canNext2 =
    scheduleImpact.trim().length > 0 &&
    costImpactDescription.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(proposedEffectiveDate)
  const canSubmit =
    authorizedSignerName.trim().length > 0 &&
    authorizedSignerTitle.trim().length > 0 &&
    ackAccuracy &&
    ackAuthority &&
    ackWrittenSupersedesVerbal &&
    ackElectronicRecords

  const submit = useCallback(async () => {
    setError(null)
    if (!canSubmit) {
      setError('Please add your name and title and check all boxes to continue.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/change-orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          masterAgreementReference: masterAgreementReference.trim(),
          currentScopeSummary: currentScopeSummary.trim(),
          requestedScopeDetail: requestedScopeDetail.trim(),
          businessRationale: businessRationale.trim(),
          scheduleImpact: scheduleImpact.trim(),
          costImpactType,
          costImpactDescription: costImpactDescription.trim(),
          proposedEffectiveDate,
          authorizedSignerName: authorizedSignerName.trim(),
          authorizedSignerTitle: authorizedSignerTitle.trim(),
          ackAccuracy: true,
          ackAuthority: true,
          ackWrittenSupersedesVerbal: true,
          ackElectronicRecords: true,
        }),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null
        setError(j?.error ?? 'Could not submit. Check required fields and try again.')
        return
      }
      const data = (await res.json()) as { change_order: ChangeOrderRow }
      onCreated(data.change_order)
      onClose()
    } catch {
      setError('We could not send your request. Please try again in a moment.')
    } finally {
      setBusy(false)
    }
  }, [
    authorizedSignerName,
    authorizedSignerTitle,
    businessRationale,
    canSubmit,
    costImpactDescription,
    costImpactType,
    currentScopeSummary,
    masterAgreementReference,
    onClose,
    onCreated,
    proposedEffectiveDate,
    requestedScopeDetail,
    scheduleImpact,
    title,
  ])

  return (
    <div className="iw-animate-slide-up rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-5 shadow-[var(--iw-shadow-2)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="iw-label">Request a scope change</p>
          <p className="mt-0.5 text-xs text-[var(--iw-text-3)]">
            Step {step + 1} of 4 — your answers are saved with your project.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Close"
          className="rounded-[var(--iw-radius-control)] p-1.5 text-[var(--iw-text-3)] transition-colors duration-150 hover:bg-[var(--iw-slate-2)] hover:text-[var(--iw-text)] disabled:pointer-events-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <StepIndicator step={step} />

      {step === 0 && (
        <div className="space-y-4">
          <label className={labelCls}>
            Short title for this request
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              disabled={busy}
              placeholder="e.g. Add events calendar to the site"
            />
          </label>
          <label className={labelCls}>
            Agreement or statement of work this relates to
            <input
              value={masterAgreementReference}
              onChange={(e) => setMasterAgreementReference(e.target.value)}
              className={inputCls}
              disabled={busy}
              placeholder="Agreement name, version, or signing date"
            />
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <label className={labelCls}>
            What we agreed is in scope today (short summary)
            <textarea
              value={currentScopeSummary}
              onChange={(e) => setCurrentScopeSummary(e.target.value)}
              className={areaCls}
              disabled={busy}
            />
          </label>
          <label className={labelCls}>
            What you want added, changed, or removed
            <textarea
              value={requestedScopeDetail}
              onChange={(e) => setRequestedScopeDetail(e.target.value)}
              className={areaCls}
              disabled={busy}
            />
          </label>
          <label className={labelCls}>
            Why this change is important for you
            <textarea
              value={businessRationale}
              onChange={(e) => setBusinessRationale(e.target.value)}
              className={areaCls}
              disabled={busy}
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className={labelCls}>
            How this might affect timeline or deadlines
            <textarea
              value={scheduleImpact}
              onChange={(e) => setScheduleImpact(e.target.value)}
              className={areaCls}
              disabled={busy}
            />
          </label>
          <label className={labelCls}>
            How you expect fees or budget to change
            <select
              value={costImpactType}
              onChange={(e) => setCostImpactType(e.target.value as ChangeOrderCostImpactType)}
              className={inputCls}
              disabled={busy}
            >
              {costOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            Tell us more about the budget or fee impact
            <textarea
              value={costImpactDescription}
              onChange={(e) => setCostImpactDescription(e.target.value)}
              className={areaCls}
              disabled={busy}
            />
          </label>
          <label className={labelCls}>
            When you would like this change to start (if approved)
            <input
              type="date"
              value={proposedEffectiveDate}
              onChange={(e) => setProposedEffectiveDate(e.target.value)}
              className={inputCls}
              disabled={busy}
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              Your full name (authorizing this request)
              <input
                value={authorizedSignerName}
                onChange={(e) => setAuthorizedSignerName(e.target.value)}
                className={inputCls}
                disabled={busy}
                placeholder="Full legal name"
              />
            </label>
            <label className={labelCls}>
              Your role or title
              <input
                value={authorizedSignerTitle}
                onChange={(e) => setAuthorizedSignerTitle(e.target.value)}
                className={inputCls}
                disabled={busy}
                placeholder="CEO, Owner, etc."
              />
            </label>
          </div>

          <div className="space-y-3 rounded-[var(--iw-radius-control)] border border-[var(--iw-border)] bg-[var(--iw-slate-2)] p-4">
            <p className="iw-label">Please confirm the following</p>
            <AckRow
              checked={ackAccuracy}
              onChange={setAckAccuracy}
              disabled={busy}
              label={changeOrderLegalCopy.ackAccuracy.label}
              detail={changeOrderLegalCopy.ackAccuracy.detail}
            />
            <AckRow
              checked={ackAuthority}
              onChange={setAckAuthority}
              disabled={busy}
              label={changeOrderLegalCopy.ackAuthority.label}
              detail={changeOrderLegalCopy.ackAuthority.detail}
            />
            <AckRow
              checked={ackWrittenSupersedesVerbal}
              onChange={setAckWrittenSupersedesVerbal}
              disabled={busy}
              label={changeOrderLegalCopy.ackWrittenSupersedesVerbal.label}
              detail={changeOrderLegalCopy.ackWrittenSupersedesVerbal.detail}
            />
            <AckRow
              checked={ackElectronicRecords}
              onChange={setAckElectronicRecords}
              disabled={busy}
              label={changeOrderLegalCopy.ackElectronicRecords.label}
              detail={changeOrderLegalCopy.ackElectronicRecords.detail}
            />
          </div>
        </div>
      )}

      {error ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-[var(--iw-radius-control)] border border-[var(--iw-red)]/30 bg-[var(--iw-red)]/10 px-3 py-2 text-sm text-[var(--iw-red)]"
        >
          <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--iw-border)] pt-4">
        {step > 0 ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
          >
            Back
          </Button>
        ) : null}
        {step < 3 ? (
          <Button
            type="button"
            variant="primary"
            disabled={
              busy ||
              (step === 0 && !canNext0) ||
              (step === 1 && !canNext1) ||
              (step === 2 && !canNext2)
            }
            onClick={() => setStep((s) => (s < 3 ? ((s + 1) as Step) : s))}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            loading={busy}
            disabled={!canSubmit}
            onClick={() => void submit()}
          >
            {busy ? 'Submitting…' : 'Submit request'}
          </Button>
        )}
        <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function AckRow({
  checked,
  onChange,
  disabled,
  label,
  detail,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled: boolean
  label: string
  detail: string
}) {
  return (
    <label className="flex cursor-pointer gap-3 text-sm">
      <span className="relative mt-0.5 flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        {/* Custom checkbox */}
        <span className="flex h-4 w-4 items-center justify-center rounded border border-[var(--iw-border-2)] bg-[var(--iw-slate-3)] transition-[background-color,border-color] duration-150 peer-checked:border-[var(--iw-teal)] peer-checked:bg-[var(--iw-teal)] peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--iw-teal)] peer-focus-visible:ring-offset-1">
          {checked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1.5 5l2.5 2.5L8.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </span>
      <span>
        <span className="font-medium text-[var(--iw-text)]">{label}</span>
        <span className="mt-0.5 block text-xs text-[var(--iw-text-2)]">{detail}</span>
      </span>
    </label>
  )
}
