'use client'

import { AuthenticateWithRedirectCallback, useAuth, useClerk } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'

const CONTINUE_ATTEMPTS_KEY = 'iw_portal_post_auth_continue_attempts'
const NAV_PENDING_KEY = 'iw_portal_post_auth_nav_pending'
/** Throttle Clerk primary `redirectToSignIn` when `from=continue` + no client session (avoids redirect ping-pong). */
const PRIMARY_SIGNIN_COOLDOWN_KEY = 'iw_portal_post_auth_primary_signin_ts'

const MAX_CONTINUE_ATTEMPTS = 5
/** After this many continue round-trips with a client `userId`, clear client session and use Clerk hosted sign-in. */
const SIGN_OUT_AFTER_ATTEMPTS = 3
/** Reset attempt counter after this idle gap (new login / new tab session). */
const ATTEMPT_WINDOW_MS = 3 * 60 * 1000
/** Drop stale nav locks so a later visit to `/post-auth` in the same tab is not blocked forever. */
const NAV_PENDING_TTL_MS = 12_000
/** Wait before assuming no client session after `?from=continue` (Clerk can hydrate `userId` late). */
const FROM_CONTINUE_NO_USER_GRACE_MS = 2800
/** If navigation to `/post-auth/continue` never runs (e.g. hung SDK), drop the lock so the effect can retry. */
const NAV_ASSIGN_SAFETY_CLEAR_MS = 12_000

function isSatellite(): boolean {
  return process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true'
}

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

function clearPostAuthFlowState(): void {
  sessionStorage.removeItem(CONTINUE_ATTEMPTS_KEY)
  sessionStorage.removeItem(NAV_PENDING_KEY)
}

/**
 * Satellite: always use Clerk’s hosted sign-in so the primary domain can issue a session that syncs here.
 * Non-satellite: same-origin `/sign-in` (add `resync` for a short explanation banner).
 */
function escapeToSignIn(clerk: ReturnType<typeof useClerk>): void {
  const back = `${window.location.origin}/post-auth`
  if (isSatellite()) {
    void clerk.redirectToSignIn({ redirectUrl: back })
    return
  }
  window.location.assign('/sign-in?resync=1')
}

/**
 * OAuth / satellite returns often include Clerk query params that must be handled
 * client-side (`handleRedirectCallback`) before the session cookie exists.
 *
 * After `userId` is present in the browser, use `router.refresh()` + full navigation to `/post-auth/continue`.
 *
 * `?from=continue` means the server did not see a session on `/post-auth/continue` — the client may still
 * show `userId` (phantom session) or neither; after a grace period with still no `userId`, use Clerk hosted sign-in.
 */
export function PostAuthClient() {
  const { isLoaded, userId } = useAuth()
  const clerk = useClerk()
  const router = useRouter()
  const searchParams = useSearchParams()
  const qs = searchParams?.toString() ?? ''
  const needsRedirectCallback = useMemo(() => qs.includes('__clerk'), [qs])
  const fromContinue = searchParams.get('from') === 'continue'
  const userIdRef = useRef(userId)
  userIdRef.current = userId

  useEffect(() => {
    if (fromContinue) sessionStorage.removeItem(NAV_PENDING_KEY)
  }, [fromContinue])

  /**
   * Server returned from `/post-auth/continue` without a session and the browser still shows no `userId`
   * after a short grace period — send through Clerk hosted sign-in (required for satellite cookie sync).
   * (No primary-host cooldown here: a previous cooldown gate left users stuck on this screen forever.)
   */
  useEffect(() => {
    if (needsRedirectCallback || !fromContinue || !isLoaded || userId) return

    const t = setTimeout(() => {
      if (userIdRef.current) return
      clearPostAuthFlowState()
      sessionStorage.setItem(PRIMARY_SIGNIN_COOLDOWN_KEY, String(Date.now()))
      escapeToSignIn(clerk)
    }, FROM_CONTINUE_NO_USER_GRACE_MS)

    return () => clearTimeout(t)
  }, [needsRedirectCallback, fromContinue, isLoaded, userId, clerk])

  useEffect(() => {
    if (needsRedirectCallback) return
    if (!isLoaded) return

    if (userId) {
      if (isNavPending()) return

      const prev = readContinueAttempts()
      const inBurst = Date.now() - prev.t < 120_000
      if (fromContinue && inBurst && prev.n >= SIGN_OUT_AFTER_ATTEMPTS - 1) {
        clearPostAuthFlowState()
        sessionStorage.setItem(PRIMARY_SIGNIN_COOLDOWN_KEY, String(Date.now()))
        void clerk.signOut().then(() => escapeToSignIn(clerk))
        return
      }

      setNavPending()

      const attempts = bumpContinueAttempts()
      if (attempts > MAX_CONTINUE_ATTEMPTS) {
        clearPostAuthFlowState()
        sessionStorage.setItem(PRIMARY_SIGNIN_COOLDOWN_KEY, String(Date.now()))
        void clerk.signOut().then(() => escapeToSignIn(clerk))
        return
      }

      const safetyClear = window.setTimeout(() => {
        sessionStorage.removeItem(NAV_PENDING_KEY)
      }, NAV_ASSIGN_SAFETY_CLEAR_MS)

      void (async () => {
        try {
          // Do not `await clerk.session.reload()` — it can hang indefinitely and block navigation.
          router.refresh()
          await Promise.resolve()
          window.location.assign('/post-auth/continue')
        } catch {
          sessionStorage.removeItem(NAV_PENDING_KEY)
        } finally {
          window.clearTimeout(safetyClear)
        }
      })()

      return () => window.clearTimeout(safetyClear)
    }

    const towardSignIn = setTimeout(() => {
      if (fromContinue) return
      clearPostAuthFlowState()
      escapeToSignIn(clerk)
    }, 2800)

    return () => clearTimeout(towardSignIn)
  }, [needsRedirectCallback, fromContinue, isLoaded, userId, router, clerk])

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-[var(--iw-text-2)]">Finishing sign-in…</p>
      {fromContinue ? (
        <p className="text-xs text-[var(--iw-text-2)]">
          Syncing your account with this app. If the server still does not see a session, you will be sent to sign in
          again on the account host (satellite) or on this page.
        </p>
      ) : null}
      <button
        type="button"
        className="text-xs font-medium text-[var(--iw-teal-light)] underline"
        onClick={() => {
          clearPostAuthFlowState()
          void clerk.signOut().then(() => escapeToSignIn(clerk))
        }}
      >
        Cancel and sign in again
      </button>
    </div>
  )
}
