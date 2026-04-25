import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <p className="mb-4 max-w-md text-center text-sm text-[var(--iw-text-2)]">
        Create your account below to access the client portal. If the dashboard does not appear after
        sign-up, wait a moment and refresh, or contact{' '}
        <a className="text-[var(--iw-teal-light)] underline" href="mailto:john.schibelli@intrawebtech.com">
          john.schibelli@intrawebtech.com
        </a>
        .
      </p>
      <SignUp
        appearance={{
          elements: {
            card: 'bg-[var(--iw-slate-3)] border border-[var(--iw-border)] shadow-none',
            headerTitle: 'text-[var(--iw-text)]',
            formFieldInput:
              'bg-[var(--iw-slate-3)] border border-[var(--iw-border-2)] text-[var(--iw-text)]',
            formButtonPrimary: 'bg-[var(--iw-teal)] hover:bg-[var(--iw-teal-light)] text-white',
          },
        }}
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  )
}
