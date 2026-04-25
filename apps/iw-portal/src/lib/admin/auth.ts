import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { StaffAuditLogRow, StaffRole, StaffUser } from '@/lib/supabase/types'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export type StaffProfile = StaffUser

export function canMutateStaff(role: StaffRole): boolean {
  return role === 'admin' || role === 'ops' || role === 'support'
}

export async function getStaffProfile(): Promise<StaffProfile | null> {
  const { userId } = await auth()
  if (!userId) return null

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

  if (error || !data) return null
  return data as StaffProfile
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
