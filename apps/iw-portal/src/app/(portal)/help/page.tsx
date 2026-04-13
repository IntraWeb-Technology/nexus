import { FaqAccordion } from '@/components/portal/FaqAccordion'
import { Card } from '@/components/ui/Card'

export default function HelpPage() {
  const supportEmail = process.env.STAFF_EMAIL ?? 'john.schibelli@intrawebtech.com'
  const supportName = process.env.STAFF_DISPLAY_NAME ?? 'IntraWeb support'

  return (
    <div className="iw-animate-slide-up space-y-6">
      <div>
        <h1>Help &amp; FAQ</h1>
        <p className="mt-1 text-sm text-[var(--iw-text-2)]">
          Common questions about your project, billing, and what to expect.
        </p>
      </div>

      <FaqAccordion />

      <Card>
        <p className="iw-label mb-4">Contact your team</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          {/* Contact info */}
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--iw-radius-control)] bg-[var(--iw-slate-2)] text-[var(--iw-teal)]"
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M15 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2l2 2 2-2h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--iw-text)]">{supportName}</p>
              <a
                className="mt-0.5 block text-sm text-[var(--iw-teal-light)] transition-colors duration-150 hover:text-[var(--iw-teal)] hover:underline"
                href={`mailto:${supportEmail}`}
              >
                {supportEmail}
              </a>
            </div>
          </div>

          {/* Response time */}
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--iw-radius-control)] bg-[var(--iw-slate-2)] text-[var(--iw-text-3)]"
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.25" />
                <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--iw-text)]">Response time</p>
              <p className="mt-0.5 text-sm text-[var(--iw-text-2)]">
                Within one business day for most requests.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 border-t border-[var(--iw-border)] pt-4 text-xs text-[var(--iw-text-3)]">
          For urgent issues, mention &ldquo;urgent&rdquo; in your subject line and we&apos;ll
          prioritize accordingly.
        </p>
      </Card>
    </div>
  )
}
