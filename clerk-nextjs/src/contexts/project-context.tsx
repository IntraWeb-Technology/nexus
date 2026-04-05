'use client'

import type { Client, Project } from '@/lib/supabase/types'
import { createContext, useContext, type ReactNode } from 'react'

export interface ProjectContextValue {
  client: Client
  project: Project
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
