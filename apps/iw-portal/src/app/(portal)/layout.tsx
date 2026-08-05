import { BottomNav } from '@/components/layout/BottomNav'
import { CommandPalette } from '@/components/command/CommandPalette'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ProjectProvider } from '@/contexts/project-context'
import { getPortalBundle } from '@/lib/data/portal'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import type { ReactNode } from 'react'

/** Fresh server render each request (auth, project cookie, Supabase + CRM-backed stats). */
export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { userId, redirectToSignIn } = await auth()
  if (!userId) return redirectToSignIn({ returnBackUrl: '/dashboard' })

  const bundle = await getPortalBundle()
  if (!bundle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--iw-slate)] p-8">
        <div className="max-w-lg rounded-[var(--radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-2)] p-6">
          <h1 className="text-center text-lg font-semibold text-[var(--iw-text)]">
            We&apos;re setting up your portal access
          </h1>
          <p className="mt-3 text-center text-sm text-[var(--iw-text-2)]">
            Your account is signed in, but a client project is not linked yet. This usually completes
            shortly after invite or sign-up provisioning.
          </p>
          <p className="mt-4 text-center text-sm text-[var(--iw-text)]">
            If this takes more than a minute, contact{' '}
            <a className="text-[var(--iw-teal-light)] underline" href="mailto:human@intrawebtech.com">
              human@intrawebtech.com
            </a>
            .
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/post-auth"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--iw-border-2)] bg-[var(--iw-slate-3)] px-4 py-2 text-sm font-medium text-[var(--iw-text)] transition-colors hover:bg-[var(--iw-slate-3)]/80"
            >
              Retry portal access
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--iw-border-2)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--iw-teal-light)] transition-colors hover:bg-[var(--iw-slate-3)]"
            >
              Use a different account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProjectProvider value={bundle}>
      {/* Skip-to-content: visually hidden until keyboard-focused (WCAG 2.4.1) */}
      <a href="#portal-main" className="skip-link">
        Skip to main content
      </a>
      {/* calc combines BottomNav clearance (5rem) + iPhone home-indicator safe area on mobile */}
      <div className="min-h-screen bg-[var(--iw-slate)] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Sidebar
          projects={bundle.projects}
          activeSlug={bundle.project.slug}
          unreadMessages={bundle.unreadMessages}
          unreadNotifications={bundle.unreadNotifications}
        />
        <Topbar
          clientName={bundle.client.name}
          projects={bundle.projects}
          activeSlug={bundle.project.slug}
          unreadNotifications={bundle.unreadNotifications}
        />
        {/*
         * Sidebar-aware content column:
         *   - Mobile: full-width, padded inset
         *   - md+:  left margin clears the fixed sidebar; inner div centres content with max-w
         * The static IW Portal design uses a wider bento canvas; individual text blocks
         * still cap line length inside cards.
         */}
        <main id="portal-main" className="pt-[var(--iw-topbar-height)] md:ml-[var(--iw-sidebar-width)]">
          <div className="mx-auto max-w-[1380px] px-4 pb-10 pt-8 sm:px-6 md:px-8 md:pt-10">
            {children}
          </div>
        </main>
        <BottomNav />
        <CommandPalette />
      </div>
    </ProjectProvider>
  )
}
