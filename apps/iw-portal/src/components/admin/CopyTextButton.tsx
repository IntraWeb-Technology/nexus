'use client'

import { useCallback, useState } from 'react'

export function CopyTextButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false)
  const onClick = useCallback(() => {
    void navigator.clipboard.writeText(text).then(() => {
      setDone(true)
      window.setTimeout(() => setDone(false), 2000)
    })
  }, [text])

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-[var(--iw-border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--iw-text-2)] hover:border-[var(--iw-teal)] hover:text-[var(--iw-teal)]"
    >
      {done ? 'Copied' : label}
    </button>
  )
}
