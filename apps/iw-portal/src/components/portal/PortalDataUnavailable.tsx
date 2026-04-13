/**
 * Shown when a portal page cannot load Supabase or bundle data (instead of a blank main area).
 */
export function PortalDataUnavailable() {
  return (
    <div className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] p-6 text-sm text-[var(--iw-text-2)]">
      <p className="font-medium text-[var(--iw-text)]">Unable to load this page</p>
      <p className="mt-2">
        Refresh the page. If it keeps happening, confirm{' '}
        <code className="text-[var(--iw-teal-light)]">SUPABASE_SERVICE_ROLE_KEY</code> and{' '}
        <code className="text-[var(--iw-teal-light)]">NEXT_PUBLIC_SUPABASE_URL</code> are set on the
        server, or that your Clerk JWT template for Supabase is configured.
      </p>
    </div>
  )
}
