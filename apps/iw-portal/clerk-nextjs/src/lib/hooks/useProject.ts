'use client'

import { useProjectContext } from '@/contexts/project-context'

export function useProject() {
  return useProjectContext()
}
