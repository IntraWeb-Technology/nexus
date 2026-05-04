import { getStaffProfile } from '@/lib/admin/auth'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PostAuthContinuePage() {
  const { userId } = await auth()
  // Avoid `redirectToSignIn` here: the client may already have a session while the server has not
  // yet observed the cookie after a soft navigation — that produced a sign-in ↔ post-auth loop.
  if (!userId) redirect('/post-auth?from=continue')

  const staff = await getStaffProfile()
  if (staff) redirect('/admin')
  redirect('/dashboard')
}
