import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Document } from '@/lib/supabase/types'

export function DocumentList({ documents }: { documents: Document[] }) {
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
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {d.requires_signature && !d.signed ? (
              <Badge variant="amber">Sign required</Badge>
            ) : null}
            <a
              href={d.file_url}
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
