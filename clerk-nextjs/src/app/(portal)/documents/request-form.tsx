'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'

export function DocumentRequestForm() {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')

  async function submit() {
    if (!name.trim()) return
    setStatus('idle')
    try {
      const res = await fetch('/api/document-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ document_name: name.trim() }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('ok')
      setName('')
    } catch {
      setStatus('err')
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        placeholder="What do you need?"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="button" variant="primary" onClick={() => void submit()}>
        Request
      </Button>
      {status === 'ok' ? (
        <span className="text-sm text-[var(--iw-green)]">Request sent.</span>
      ) : null}
      {status === 'err' ? (
        <span className="text-sm text-[var(--iw-red)]">Could not send. Try again.</span>
      ) : null}
    </div>
  )
}
