import { createServerSupabaseForUser, createServiceSupabase } from '@/lib/supabase/server'
import type { StaffAuditLogRow, StaffRole, StaffUser } from '@/lib/supabase/types'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export type StaffProfile = StaffUser
type UserScopedSupabase = NonNullable<Awaited<ReturnType<typeof createServerSupabaseForUser>>>
type StaffLookupClient = ReturnType<typeof createServiceSupabase> | UserScopedSupabase

export function canMutateStaff(role: StaffRole): boolean {
  return role === 'admin' || role === 'ops' || role === 'support'
}

function allowedStaffEmailsFromEnv(): Set<string> {
  const values = [process.env.STAFF_EMAIL, process.env.STAFF_EMAILS]
  const emails = new Set<string>()
  for (const raw of values) {
    for (const part of (raw ?? '').split(',')) {
      const email = part.trim().toLowerCase()
      if (email) emails.add(email)
    }
  }
  return emails
}

function roleFromSessionClaims(sessionClaims: unknown): string {
  if (!sessionClaims || typeof sessionClaims !== 'object') return ''
  const claims = sessionClaims as Record<string, unknown>
  const role = claims.org_role
  return typeof role === 'string' ? role.trim().toLowerCase() : ''
}

function isOrgAdminRole(role: string): boolean {
  if (!role) return false
  return role === 'admin' || role === 'org:admin' || role.endsWith(':admin')
}

export async function getStaffProfile(): Promise<StaffProfile | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const primaryEmail = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? null
  if (!primaryEmail) return null

  const displayName =
    [user?.firstName, user?.lastName]
      .filter((v): v is string => typeof v === 'string' && Boolean(v.trim()))
      .join(' ')
      .trim() || null

  const orgRole = roleFromSessionClaims(sessionClaims)
  const isOrgAdmin = isOrgAdminRole(orgRole)
  const allowedEmails = allowedStaffEmailsFromEnv()
  const isEmailAllowed = allowedEmails.size === 0 || allowedEmails.has(primaryEmail)

  const matchesSessionIdentity = (staff: StaffProfile | null): StaffProfile | null => {
    if (!staff) return null
    const staffEmail = staff.email?.trim().toLowerCase()
    if (!staffEmail) return null
    // Defense in depth: require both Clerk user id mapping and matching staff email.
    if (staff.clerk_user_id !== userId) return null
    if (staffEmail !== primaryEmail) return null
    return staff
  }

  const findByEmail = async (source: StaffLookupClient) => {
    const { data, error } = await source
      .from('staff_users')
      .select('*')
      .ilike('email', primaryEmail)
      .eq('is_active', true)
      .maybeSingle()
    if (error || !data) return null
    const staff = data as StaffProfile
    if (staff.clerk_user_id !== userId) {
      try {
        const service = createServiceSupabase()
        await service.from('staff_users').update({ clerk_user_id: userId }).eq('id', staff.id)
      } catch {
        // Best-effort reconciliation only; matching email still confirms identity.
      }
    }
    return { ...staff, clerk_user_id: userId } as StaffProfile
  }

  const bootstrapStaffFromClerkOrg = async (): Promise<StaffProfile | null> => {
    if (!isOrgAdmin && !isEmailAllowed) return null
    try {
      const supabase = createServiceSupabase()
      const inserted = await supabase
        .from('staff_users')
        .insert({
          clerk_user_id: userId,
          email: primaryEmail,
          display_name: displayName,
          role: 'admin',
          is_active: true,
        })
        .select('*')
        .single()
      if (!inserted.error && inserted.data) return inserted.data as StaffProfile
    } catch {
      // If insert races/conflicts, read-after-write fallback below resolves the row.
    }
    try {
      const supabase = createServiceSupabase()
      const byId = await supabase
        .from('staff_users')
        .select('*')
        .eq('clerk_user_id', userId)
        .eq('is_active', true)
        .maybeSingle()
      if (!byId.error && byId.data) return matchesSessionIdentity(byId.data as StaffProfile)
      return await findByEmail(supabase)
    } catch {
      return null
    }
  }

  const loadStaff = async () => {
    // Prefer service role: RLS on `staff_users` uses `auth.jwt()->>'sub'`; if the Clerk↔Supabase
    // JWT template is misaligned in an environment, the user-scoped client returns no row even
    // for real staff. Service role is scoped here by `userId` from Clerk only.
    try {
      const supabase = createServiceSupabase()
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('clerk_user_id', userId)
        .eq('is_active', true)
        .maybeSingle()
      if (!error && data) {
        const byId = matchesSessionIdentity(data as StaffProfile)
        if (byId) return byId
      }
      const byEmail = await findByEmail(supabase)
      if (byEmail) return byEmail
    } catch {
      // Missing SUPABASE_SERVICE_ROLE_KEY / SECRET in this deploy — fall back below.
    }

    let supabase = null
    try {
      supabase = await createServerSupabaseForUser()
    } catch {
      return null
    }
    if (!supabase) return null

    const { data, error } = await supabase
      .from('staff_users')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .maybeSingle()

    if (!error && data) {
      const byId = matchesSessionIdentity(data as StaffProfile)
      if (byId) return byId
    }

    const byEmail = await findByEmail(supabase)
    if (byEmail) return byEmail

    return bootstrapStaffFromClerkOrg()
  }

  return loadStaff()
}

export async function requireStaff(): Promise<StaffProfile> {
  const staff = await getStaffProfile()
  if (!staff) redirect('/')
  return staff
}

export async function requireAdmin(): Promise<StaffProfile> {
  const staff = await requireStaff()
  if (staff.role !== 'admin') redirect('/admin')
  return staff
}

export async function logStaffAction(input: {
  action: string
  resourceType: string
  resourceId?: string | null
  metadata?: Record<string, unknown>
}): Promise<StaffAuditLogRow | null> {
  const staff = await getStaffProfile()
  if (!staff) return null
  let supabase = null
  try {
    supabase = await createServerSupabaseForUser()
  } catch {
    return null
  }
  if (!supabase) return null

  const { data, error } = await supabase
    .from('staff_audit_log')
    .insert({
      actor_staff_id: staff.id,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId ?? null,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single()

  if (error || !data) return null
  return data as StaffAuditLogRow
}
