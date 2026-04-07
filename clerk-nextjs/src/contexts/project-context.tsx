'use client'

import type { Client, Project } from '@/lib/supabase/types'
import { createContext, useContext, type ReactNode } from 'react'

export interface ProjectContextValue {
  client: Client
  /** Active project (portal session). */
  project: Project
  /** All projects for this client — each may map to a distinct engagement. */
  projects: Project[]
  unreadMessages: number
  unreadNotifications: number
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({
  value,
  children,
}: {
  value: ProjectContextValue
  children: ReactNode
}) {
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjectContext(): ProjectContextValue {
  const v = useContext(ProjectContext)
  if (!v) throw new Error('useProjectContext must be used within ProjectProvider')
  return v
}
