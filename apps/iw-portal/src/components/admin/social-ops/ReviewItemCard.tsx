'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { formatDate } from '@/components/admin/AdminPrimitives'
import {
  editorialCategoryLabel,
  postizBaseUrl,
  type ReviewBundle,
  type ReviewActionType,
} from '@/lib/social-ops/types'
import { reviewActionLabel } from '@/lib/social-ops/reviews/review-lifecycle'

export function ReviewItemCard({
  bundle,
  canMutate,
  defaultExpanded = false,
}: {
  bundle: ReviewBundle
  canMutate: boolean
  defaultExpanded?: boolean
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const { review, canonical, publications, actions } = bundle
  const postizUrl = postizBaseUrl()

  async function submitAction(action: ReviewActionType) {
    setError(null)
    startTransition(async () => {
      const response = await fetch(`/api/admin/social-ops/reviews/${review.id}/actions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, note: note.trim() || undefined }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? `Request failed (${response.status})`)
        return
      }
      router.refresh()
    })
  }

  return (
    <section className="iw-card">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="iw-card-head">
          <div>
            <h2 className="iw-card-title">{canonical.headline || canonical.topic || 'Untitled draft'}</h2>
            <p className="mt-1 text-sm text-[var(--iw-text-2)]">
              {editorialCategoryLabel(canonical.editorial_category)} · {formatDate(review.created_at)} · n8n{' '}
              {canonical.source_execution_id}
            </p>
          </div>
          <span className="iw-chip">{review.status}</span>
        </div>
      </button>

      {expanded ? (
        <div className="mt-4 space-y-4 border-t border-[var(--hairline)] pt-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Meta label="Risk" value={review.risk_level} />
            <Meta label="Scope" value={review.review_scope} />
            <Meta label="Quality score" value={canonical.quality_score?.toString() ?? '—'} />
            <Meta label="Novelty score" value={canonical.novelty_score?.toString() ?? '—'} />
          </div>

          {canonical.primary_url ? (
            <p className="text-sm">
              <span className="text-[var(--iw-text-2)]">Source: </span>
              <a className="text-[var(--accent)] underline" href={canonical.primary_url} target="_blank" rel="noreferrer">
                {canonical.primary_url}
              </a>
            </p>
          ) : null}

          <PreviewBlock title="Long body" body={canonical.body_long} />
          <PreviewBlock title="Short body" body={canonical.body_short} />

          <div>
            <h3 className="text-sm font-medium">Platforms</h3>
            <ul className="mt-2 space-y-2">
              {publications.map((pub) => (
                <li key={pub.id} className="rounded-lg border border-[var(--hairline)] p-3 text-sm">
                  <div className="font-medium capitalize">{pub.platform}</div>
                  <div className="mt-1 text-[var(--iw-text-2)]">
                    Postiz batch: {pub.postiz_batch_id ?? '—'} · post: {pub.postiz_post_id ?? '—'} · integration:{' '}
                    {pub.postiz_integration_id ?? '—'}
                  </div>
                  {postizUrl ? (
                    <a
                      className="mt-2 inline-block text-[var(--accent)] underline"
                      href={postizUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Postiz
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {actions.length ? (
            <div>
              <h3 className="text-sm font-medium">Review history</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {actions.map((action) => (
                  <li key={action.id} className="rounded-lg border border-[var(--hairline)] p-3">
                    <span className="font-medium">{reviewActionLabel(action.action)}</span>
                    <span className="text-[var(--iw-text-2)]"> · {formatDate(action.created_at)}</span>
                    {action.note ? <p className="mt-1 text-[var(--iw-text-2)]">{action.note}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {review.status === 'pending' && canMutate ? (
            <div className="space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional review note"
                rows={3}
                className="w-full rounded-[var(--radius-ctrl)] border border-[var(--hairline)] bg-[var(--bg-2)] px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <ActionButton disabled={pending} onClick={() => submitAction('approve')}>
                  Approve
                </ActionButton>
                <ActionButton disabled={pending} onClick={() => submitAction('request_rewrite')}>
                  Request rewrite
                </ActionButton>
                <ActionButton disabled={pending} onClick={() => submitAction('skip')} variant="muted">
                  Skip
                </ActionButton>
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-[var(--iw-text-2)]">{label}: </span>
      <span className="capitalize">{value}</span>
    </div>
  )
}

function PreviewBlock({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null
  const preview = body.length > 600 ? `${body.slice(0, 600)}…` : body
  return (
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-[var(--hairline)] bg-[var(--bg-2)] p-3 text-sm">
        {preview}
      </pre>
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'muted'
}) {
  const className =
    variant === 'muted'
      ? 'rounded-[var(--radius-ctrl)] border border-[var(--hairline)] px-4 py-2 text-sm'
      : 'rounded-[var(--radius-ctrl)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white'
  return (
    <button type="button" className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
