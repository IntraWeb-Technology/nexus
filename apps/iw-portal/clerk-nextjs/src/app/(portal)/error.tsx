'use client'

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-6 text-sm text-[var(--iw-text)]">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-2 text-[var(--iw-text-2)]">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-lg border border-[var(--iw-border-2)] px-4 py-2 text-[var(--iw-teal-light)]"
      >
        Try again
      </button>
    </div>
  )
}
