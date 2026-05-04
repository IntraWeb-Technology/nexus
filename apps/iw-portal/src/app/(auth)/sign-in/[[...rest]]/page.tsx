import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  const { userId } = await auth()
  if (userId) redirect('/post-auth')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <p className="mb-6 text-center text-sm text-[var(--iw-text-2)]">
        IntraWeb OS — Client Portal
      </p>
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
