import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

type SignInPageProps = {
  searchParams?: Promise<{ resync?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { userId } = await auth()
  if (userId) redirect('/post-auth')

  const q = searchParams ? await searchParams : {}
  const showResyncNote = q.resync === '1'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <p className="mb-6 text-center text-sm text-[var(--iw-text-2)]">
        IntraWeb OS — Client Portal
      </p>
      {showResyncNote ? (
        <p
          role="status"
          className="mb-4 max-w-md rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-4 py-3 text-center text-xs text-[var(--iw-text-2)]"
        >
          We could not keep your session in sync with this app. Sign in again below. If you use the hosted account
          site, finish there first — then you should land back on the dashboard.
        </p>
      ) : null}
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-[var(--iw-slate-3)] border border-[var(--iw-border)] shadow-none',
            headerTitle: 'text-[var(--iw-text)]',
            headerSubtitle: 'text-[var(--iw-text-2)]',
            formFieldLabel: 'text-[var(--iw-text-2)]',
            formFieldInput:
              'bg-[var(--iw-slate-3)] border border-[var(--iw-border-2)] text-[var(--iw-text)]',
            footerActionLink: 'text-[var(--iw-teal-light)]',
            formButtonPrimary: 'bg-[var(--iw-teal)] hover:bg-[var(--iw-teal-light)] text-white',
          },
        }}
        fallbackRedirectUrl="/post-auth"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
