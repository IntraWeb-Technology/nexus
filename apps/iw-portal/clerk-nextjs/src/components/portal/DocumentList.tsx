'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Document } from '@/lib/supabase/types'

function downloadHref(d: Document): string {
  const u = d.file_url
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  return `/api/documents/download?id=${encodeURIComponent(d.id)}`
}

export function DocumentList({
  documents,
  onRequestSign,
}: {
  documents: Document[]
  onRequestSign?: (d: Document) => void
}) {
  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents"
        description="Agreements and deliverables will appear here when shared."
      />
    )
  }
  return (
    <ul className="space-y-2">
      {documents.map((d) => (
        <li
          key={d.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4"
        >
          <div>
            <p className="font-medium text-[var(--iw-text)]">▤ {d.name}</p>
            <p className="text-xs text-[var(--iw-text-3)]">
              {new Date(d.created_at).toLocaleDateString()}
              {d.file_size_kb != null ? ` · ${d.file_size_kb} KB` : ''}
            </p>
            {d.signed ? (
              <p className="mt-1 text-xs text-[var(--iw-text-2)]">
                Signed by {d.signed_by ?? '—'}
                {d.signed_at ? ` on ${new Date(d.signed_at).toLocaleString()}` : ''}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {d.signed ? <Badge variant="green">Signed</Badge> : null}
            {d.requires_signature && !d.signed ? <Badge variant="amber">Sign required</Badge> : null}
            {d.requires_signature && !d.signed && onRequestSign ? (
              <Button type="button" variant="primary" className="text-xs" onClick={() => onRequestSign(d)}>
                Sign document
              </Button>
            ) : null}
            <a
              href={downloadHref(d)}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[var(--iw-teal-light)] hover:underline"
            >
              Download
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}
