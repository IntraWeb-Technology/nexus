'use client'

import { Button } from '@/components/ui/Button'
import { changeOrderLegalCopy } from '@/lib/change-order/changeOrderCopy'
import type { ChangeOrderCostImpactType } from '@/lib/change-order/schema'
import type { ChangeOrderRow } from '@/lib/supabase/types'
import { useCallback, useState } from 'react'

const inputCls =
  'mt-1 w-full rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-3 py-2 text-[var(--iw-text)]'
const labelCls = 'block text-sm text-[var(--iw-text-2)]'
const areaCls = `${inputCls} min-h-[100px] resize-y`

type Step = 0 | 1 | 2 | 3

const costOptions: { value: ChangeOrderCostImpactType; label: string }[] = [
  { value: 'none', label: 'No change to fees' },
  { value: 'increase', label: 'Fee increase expected' },
  { value: 'decrease', label: 'Fee decrease / removal' },
  { value: 'tbd', label: 'To be determined after estimate' },
]

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
    <div className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4">
      <p className="iw-label mb-1">Request a change to your scope</p>
      <p className="mb-4 text-xs text-[var(--iw-text-3)]">
        Step {step + 1} of 4. Your answers are saved with your project and we&apos;ll follow up after you submit.
      </p>

      {step === 0 ? (
        <div className="space-y-3">
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
      ) : null}

      {step === 1 ? (
        <div className="space-y-3">
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
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
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
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <label className={labelCls}>
            Your full name (person authorizing this request)
            <input
              value={authorizedSignerName}
              onChange={(e) => setAuthorizedSignerName(e.target.value)}
              className={inputCls}
              disabled={busy}
            />
          </label>
          <label className={labelCls}>
            Your role or title
            <input
              value={authorizedSignerTitle}
              onChange={(e) => setAuthorizedSignerTitle(e.target.value)}
              className={inputCls}
              disabled={busy}
            />
          </label>

          <div className="space-y-3 rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] p-3">
            <p className="text-xs font-medium text-[var(--iw-text-3)]">Please confirm the following</p>
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
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {step > 0 ? (
          <Button type="button" variant="ghost" disabled={busy} onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}>
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
          <Button type="button" variant="primary" disabled={busy || !canSubmit} onClick={() => void submit()}>
            Submit request
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
    <label className="flex cursor-pointer gap-2 text-sm text-[var(--iw-text)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1"
      />
      <span>
        <span className="font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-[var(--iw-text-2)]">{detail}</span>
      </span>
    </label>
  )
}
