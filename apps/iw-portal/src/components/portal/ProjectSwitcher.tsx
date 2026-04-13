'use client'

import { selectPortalProject } from '@/app/actions/portal'
import type { Project } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function ProjectSwitcher({ projects, activeSlug }: { projects: Project[]; activeSlug: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (projects.length <= 1) return null

  return (
    <label className="block w-full">
      <span className="sr-only">Active project</span>
      <select
        className="iw-mono w-full max-w-full rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-3)] px-2 py-1.5 text-xs text-[var(--iw-text)] outline-none focus:border-[var(--iw-teal)]"
        value={activeSlug}
        disabled={pending}
        onChange={(e) => {
          const slug = e.target.value
          startTransition(async () => {
            const r = await selectPortalProject(slug)
            if (r.ok) router.refresh()
          })
        }}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.slug}>
            {p.slug}
          </option>
        ))}
      </select>
    </label>
  )
}
