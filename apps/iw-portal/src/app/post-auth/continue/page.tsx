import { getStaffProfile } from '@/lib/admin/auth'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PostAuthContinuePage() {
  const { userId, redirectToSignIn } = await auth()
  if (!userId) return redirectToSignIn({ returnBackUrl: '/post-auth' })

  const staff = await getStaffProfile()
  if (staff) redirect('/admin')
  redirect('/dashboard')
}
