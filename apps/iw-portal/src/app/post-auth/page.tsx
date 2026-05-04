import { PostAuthClient } from './PostAuthClient'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

function PostAuthFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="text-sm text-[var(--iw-text-2)]">Loading…</p>
    </div>
  )
}

export default function PostAuthPage() {
  return (
    <Suspense fallback={<PostAuthFallback />}>
      <PostAuthClient />
    </Suspense>
  )
}
