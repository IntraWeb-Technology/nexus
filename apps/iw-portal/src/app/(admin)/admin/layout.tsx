import { AdminShell } from '@/components/admin/AdminShell'
import { requireStaff } from '@/lib/admin/auth'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaff()
  return <AdminShell staff={staff}>{children}</AdminShell>
}
