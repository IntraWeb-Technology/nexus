import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ProjectProvider } from '@/contexts/project-context'
import { PortalEmptySignOut } from '@/components/auth/PortalEmptySignOut'
import { getPortalBundle } from '@/lib/data/portal'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

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
      <div className="min-h-screen bg-[var(--iw-slate)] pb-20 md:pb-0">
        <Sidebar
          projectSlug={bundle.project.slug}
          planLabel={planLabel}
          unreadMessages={bundle.unreadMessages}
          unreadNotifications={bundle.unreadNotifications}
        />
        <Topbar
          clientName={bundle.client.name}
          projectSlug={bundle.project.slug}
          unreadNotifications={bundle.unreadNotifications}
        />
        <main className="mx-auto max-w-6xl px-4 pb-8 pt-[54px] md:pl-[calc(210px+1rem)] md:pr-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </ProjectProvider>
  )
}
