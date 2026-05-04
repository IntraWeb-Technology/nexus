'use client'

import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'

const CONTINUE_ATTEMPTS_KEY = 'iw_portal_post_auth_continue_attempts'
const NAV_PENDING_KEY = 'iw_portal_post_auth_nav_pending'
const MAX_CONTINUE_ATTEMPTS = 5
/** Reset attempt counter after this idle gap (new login / new tab session). */
const ATTEMPT_WINDOW_MS = 3 * 60 * 1000
/** Drop stale nav locks so a later visit to `/post-auth` in the same tab is not blocked forever. */
const NAV_PENDING_TTL_MS = 12_000

function isNavPending(): boolean {
  if (typeof window === 'undefined') return false
  const raw = sessionStorage.getItem(NAV_PENDING_KEY)
  if (!raw) return false
  try {
    const parsed = JSON.parse(raw) as { t?: number }
    const t = typeof parsed.t === 'number' ? parsed.t : 0
    if (!t || Date.now() - t > NAV_PENDING_TTL_MS) {
      sessionStorage.removeItem(NAV_PENDING_KEY)
      return false
    }
    return true
  } catch {
    // Legacy `"1"` or corrupt value — treat as stale.
    sessionStorage.removeItem(NAV_PENDING_KEY)
    return false
  }
}

function setNavPending(): void {
  sessionStorage.setItem(NAV_PENDING_KEY, JSON.stringify({ t: Date.now() }))
}

function readContinueAttempts(): { n: number; t: number } {
  if (typeof window === 'undefined') return { n: 0, t: Date.now() }
  try {
    const raw = sessionStorage.getItem(CONTINUE_ATTEMPTS_KEY)
    if (!raw) return { n: 0, t: Date.now() }
    const parsed = JSON.parse(raw) as { n: number; t: number }
    if (typeof parsed.n !== 'number' || typeof parsed.t !== 'number') return { n: 0, t: Date.now() }
    return parsed
  } catch {
    return { n: 0, t: Date.now() }
  }
}

function bumpContinueAttempts(): number {
  const now = Date.now()
  const prev = readContinueAttempts()
  const next = now - prev.t > ATTEMPT_WINDOW_MS ? 1 : prev.n + 1
  sessionStorage.setItem(CONTINUE_ATTEMPTS_KEY, JSON.stringify({ n: next, t: now }))
  return next
}

/**
 * OAuth / satellite returns often include Clerk query params that must be handled
 * client-side (`handleRedirectCallback`) before the session cookie exists.
 *
 * After `userId` is present in the browser, a soft `router.replace` to a server page can run
 * before cookies are visible to `auth()` — use `router.refresh()` + full navigation to `/post-auth/continue`.
 *
 * `sessionStorage` navigation lock avoids duplicate navigations under React Strict Mode (refs reset on remount).
 */
export function PostAuthClient() {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const qs = searchParams?.toString() ?? ''
  const needsRedirectCallback = useMemo(() => qs.includes('__clerk'), [qs])
  const fromContinue = searchParams.get('from') === 'continue'

  useEffect(() => {
    if (fromContinue) sessionStorage.removeItem(NAV_PENDING_KEY)
  }, [fromContinue])

  useEffect(() => {
    if (needsRedirectCallback) return
    if (!isLoaded) return

    if (userId) {
      if (isNavPending()) return
      setNavPending()

      const attempts = bumpContinueAttempts()
      if (attempts > MAX_CONTINUE_ATTEMPTS) {
        sessionStorage.removeItem(CONTINUE_ATTEMPTS_KEY)
        sessionStorage.removeItem(NAV_PENDING_KEY)
        router.replace('/sign-in')
        return
      }

      void (async () => {
        try {
          router.refresh()
          await Promise.resolve()
          window.location.assign('/post-auth/continue')
        } catch {
          sessionStorage.removeItem(NAV_PENDING_KEY)
        }
      })()
      return
    }

    const towardSignIn = setTimeout(() => {
      sessionStorage.removeItem(CONTINUE_ATTEMPTS_KEY)
      router.replace('/sign-in')
    }, 2800)

    return () => clearTimeout(towardSignIn)
  }, [needsRedirectCallback, isLoaded, userId, router])

  if (needsRedirectCallback) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
        <p className="text-sm text-[var(--iw-text-2)]">Completing sign-in…</p>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/post-auth"
          signUpFallbackRedirectUrl="/post-auth"
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
