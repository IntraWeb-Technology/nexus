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
      className="relative z-20 w-full max-w-md rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-6 shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-doc-title"
    >
      <h2 id="sign-doc-title" className="text-base font-semibold text-[var(--iw-text)]">
        Sign document
      </h2>
      <p className="mt-2 text-sm text-[var(--iw-text-2)]">{document.name}</p>
      <label className="mt-4 block text-sm text-[var(--iw-text-2)]">
        Type your full legal name to sign
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-3 py-2 text-[var(--iw-text)]"
          autoComplete="name"
          disabled={busy}
        />
      </label>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
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
          Confirm signature
        </Button>
      </div>
    </div>
  )
}
