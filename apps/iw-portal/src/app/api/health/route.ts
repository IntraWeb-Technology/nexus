import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

function keyKind(value: string, livePrefix: string, testPrefix: string): 'live' | 'test' | 'unknown' | 'missing' {
  if (!value) return 'missing'
  if (value.startsWith(livePrefix)) return 'live'
  if (value.startsWith(testPrefix)) return 'test'
  return 'unknown'
}

/**
 * Unauthenticated health probe for production debugging (Clerk keys present + live/test match).
 * Does not expose secret values.
 */
export async function GET() {
  const h = await headers()
  const requestHost =
    h.get('x-forwarded-host')?.split(',')[0]?.trim() || h.get('host') || null

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''
  const sk = process.env.CLERK_SECRET_KEY ?? ''
  const publishable = keyKind(pk, 'pk_live_', 'pk_test_')
  const secret = keyKind(sk, 'sk_live_', 'sk_test_')
  const mismatchedPair =
    (publishable === 'live' && secret !== 'live') ||
    (publishable === 'test' && secret !== 'test') ||
    (secret === 'live' && publishable !== 'live') ||
    (secret === 'test' && publishable !== 'test')

  const ok =
    publishable !== 'missing' &&
    secret !== 'missing' &&
    publishable !== 'unknown' &&
    secret !== 'unknown' &&
    !mismatchedPair

  return NextResponse.json(
    {
      ok,
      clerk: {
        publishableKey: publishable,
        secretKey: secret,
        mismatchedLiveTestPair: mismatchedPair,
        /** Helps debug Clerk `host_invalid`: this host must exist on the Clerk app for that publishable key. */
        requestHost,
      },
    },
    { status: ok ? 200 : 503 },
  )
}
