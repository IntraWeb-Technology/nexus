/** Canonical app origin for Stripe return URLs (no trailing slash). */
export function billingAppOrigin(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!u) {
    throw new Error('NEXT_PUBLIC_APP_URL is not set — required for Stripe redirect URLs')
  }
  return u.replace(/\/$/, '')
}
