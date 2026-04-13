import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ProjectProvider } from '@/contexts/project-context'
import { PortalEmptySignOut } from '@/components/auth/PortalEmptySignOut'
import { getPortalBundle } from '@/lib/data/portal'
import { auth } from '@clerk/nextjs/server'
import type { ReactNode } from 'react'

/** Fresh server render each request (auth, project cookie, Supabase + CRM-backed stats). */
export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { userId, redirectToSignIn } = await auth()
  if (!userId) return redirectToSignIn()

  const bundle = await getPortalBundle()
  if (!bundle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--iw-slate)] p-8">
        <p className="max-w-md text-center text-sm text-[var(--iw-text)]">
          No client record is linked to this account yet. If you were invited to the portal,
          contact{' '}
          <a className="text-[var(--iw-teal-light)] underline" href="mailto:john.schibelli@intrawebtech.com">
            john.schibelli@intrawebtech.com
          </a>
          .
        </p>
        <PortalEmptySignOut />
      </div>
    )
  }

  const planLabel =
    bundle.project.plan === 'growth'
      ? 'Growth'
      : bundle.project.plan === 'starter'
        ? 'Starter'
        : 'Custom'

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
          planLabel={planLabel}
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
         * Max-w-[960px] keeps line-length comfortable on wide desktops while the sidebar
         * occupies the left 256px — total used: 256 + 960 = 1216px at 1440px viewport.
         */}
        <main id="portal-main" className="pt-[var(--iw-topbar-height)] md:ml-[var(--iw-sidebar-width)]">
          <div className="mx-auto max-w-[960px] px-4 pb-10 pt-8 sm:px-6 md:px-8 md:pt-10">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </ProjectProvider>
  )
}
