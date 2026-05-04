'use client'

import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'

/**
 * OAuth / satellite returns often include Clerk query params that must be handled
 * client-side (`handleRedirectCallback`) before the session cookie exists. A server-only
 * `/post-auth` that calls `auth()` first can see no user and call `redirectToSignIn` in a loop.
 */
export function PostAuthClient() {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const qs = searchParams?.toString() ?? ''
  const needsRedirectCallback = useMemo(() => qs.includes('__clerk'), [qs])

  useEffect(() => {
    if (needsRedirectCallback) return
    if (!isLoaded) return
    if (userId) router.replace('/post-auth/continue')
    else router.replace('/sign-in')
  }, [needsRedirectCallback, isLoaded, userId, router])

  if (needsRedirectCallback) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
        <p className="text-sm text-[var(--iw-text-2)]">Completing sign-in…</p>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/post-auth/continue"
          signUpFallbackRedirectUrl="/post-auth/continue"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4">
      <p className="text-sm text-[var(--iw-text-2)]">Finishing sign-in…</p>
    </div>
  )
}
