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

function FileIcon() {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--iw-radius-control)] bg-[var(--iw-slate-2)] text-[var(--iw-teal)]"
      aria-hidden="true"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 2.5h7l3.5 3.5v12a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5v-15A.5.5 0 0 1 5 2.5Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path d="M12 2.5V6H15.5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M7.5 10.5h5M7.5 13h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </span>
  )
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
    <ul className="iw-enter-stagger space-y-2">
      {documents.map((d) => (
        <li
          key={d.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4 shadow-[var(--iw-shadow-1)] transition-[box-shadow,border-color] duration-300 hover:border-[var(--iw-border-2)] hover:shadow-[var(--iw-shadow-2)]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileIcon />
            <div className="min-w-0">
              <p className="truncate font-medium text-[var(--iw-text)]">{d.name}</p>
              <p className="mt-0.5 text-xs text-[var(--iw-text-3)]">
                {new Date(d.created_at).toLocaleDateString()}
                {d.file_size_kb != null ? ` · ${d.file_size_kb} KB` : ''}
              </p>
              {d.signed ? (
                <p className="mt-1 text-xs text-[var(--iw-green)]">
                  Signed by {d.signed_by ?? '—'}
                  {d.signed_at ? ` on ${new Date(d.signed_at).toLocaleString()}` : ''}
                </p>
              ) : null}
            </div>
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
              className="inline-flex items-center gap-1 text-sm text-[var(--iw-teal-light)] transition-colors duration-200 hover:text-[var(--iw-teal)] hover:underline"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}
