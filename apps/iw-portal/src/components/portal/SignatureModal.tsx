'use client'

import { Button } from '@/components/ui/Button'
import type { Document } from '@/lib/supabase/types'
import { useCallback, useState } from 'react'

type SignatureModalProps = {
  document: Document | null
  open: boolean
  onClose: () => void
  onSigned: (doc: Document) => void
}

export function SignatureModal({ document, open, onClose, onSigned }: SignatureModalProps) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setName('')
    setError(null)
    setBusy(false)
  }, [])

  const close = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const confirm = useCallback(async () => {
    if (!document) return
    const trimmed = name.trim()
    if (trimmed.length < 3) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/documents/sign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ document_id: document.id, typed_name: trimmed }),
      })
      if (res.status === 409) {
        setError('This document was already signed.')
        return
      }
      if (!res.ok) {
        setError('Could not sign. Try again later.')
        return
      }
      const data = (await res.json()) as { document: Document }
      onSigned(data.document)
      close()
    } catch {
      setError('Could not sign. Try again later.')
    } finally {
      setBusy(false)
    }
  }, [close, document, name, onSigned])

  if (!open || !document) return null

  return (
    <div
      className="iw-animate-slide-up relative z-20 w-full max-w-md rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-6 shadow-[var(--iw-shadow-3)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-doc-title"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="sign-doc-title" className="text-base font-semibold text-[var(--iw-text)]">
            Sign document
          </h2>
          <p className="mt-1 text-sm text-[var(--iw-text-2)]">{document.name}</p>
        </div>
        <button
          type="button"
          onClick={close}
          disabled={busy}
          aria-label="Close"
          className="rounded-[var(--iw-radius-control)] p-1 text-[var(--iw-text-3)] transition-colors duration-150 hover:bg-[var(--iw-slate-2)] hover:text-[var(--iw-text)] disabled:pointer-events-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Legal notice */}
      <div className="mb-4 rounded-[var(--iw-radius-control)] bg-[var(--iw-slate-2)] px-3 py-2.5 text-xs text-[var(--iw-text-3)]">
        By typing your full name below you are providing a legally binding electronic signature for
        this document.
      </div>

      {/* Input */}
      <label className="block text-sm text-[var(--iw-text-2)]">
        Full legal name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-[var(--iw-radius-control)] border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-3 py-2 text-[var(--iw-text)] transition-[border-color] duration-200 focus:border-[var(--iw-teal)] focus:outline-none disabled:opacity-50"
          placeholder="e.g. Jane Smith"
          autoComplete="name"
          autoFocus
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim().length >= 3) void confirm()
          }}
        />
      </label>

      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--iw-red)]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      ) : null}

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={close} disabled={busy}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => void confirm()}
          disabled={busy || name.trim().length < 3}
        >
          {busy ? 'Signing…' : 'Confirm signature'}
        </Button>
      </div>
    </div>
  )
}
