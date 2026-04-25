'use server'

import { logStaffAction, requireAdmin, requireStaff } from '@/lib/admin/auth'
import { createRlsSupabaseForUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function supabaseForMutation() {
  const supabase = await createRlsSupabaseForUser()
  if (!supabase) throw new Error('Supabase RLS client unavailable')
  return supabase
}

export async function updateChangeOrderStatus(formData: FormData) {
  const staff = await requireStaff()
  if (staff.role === 'viewer') throw new Error('Viewer role cannot update change orders')
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  const staffNotes = String(formData.get('staff_notes') ?? '')
  if (!id || !['reviewed', 'approved', 'declined'].includes(status)) {
    throw new Error('Invalid change order update')
  }

  const supabase = await supabaseForMutation()
  const { error } = await supabase
    .from('change_orders')
    .update({ status, staff_notes: staffNotes || null })
    .eq('id', id)
  if (error) throw error

  await logStaffAction({
    action: 'change_order.update_status',
    resourceType: 'change_order',
    resourceId: id,
    metadata: { status, staff_notes_present: Boolean(staffNotes) },
  })
  revalidatePath('/admin/change-orders')
}

export async function markIntegrationEventReplayed(formData: FormData) {
  const staff = await requireStaff()
  if (staff.role === 'viewer') throw new Error('Viewer role cannot replay integration events')
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('Missing integration event id')

  const supabase = await supabaseForMutation()
  const { error } = await supabase
    .from('integration_events')
    .update({
      status: 'replayed',
      replayed_at: new Date().toISOString(),
      replayed_by_staff_id: staff.id,
    })
    .eq('id', id)
  if (error) throw error

  await logStaffAction({
    action: 'integration_event.mark_replayed',
    resourceType: 'integration_event',
    resourceId: id,
  })
  revalidatePath('/admin/integrations')
}

export async function updateStaffRole(formData: FormData) {
  const admin = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const role = String(formData.get('role') ?? '')
  if (!id || !['admin', 'ops', 'support', 'viewer'].includes(role)) {
    throw new Error('Invalid staff role update')
  }

  const supabase = await supabaseForMutation()
  const { error } = await supabase.from('staff_users').update({ role }).eq('id', id)
  if (error) throw error

  await logStaffAction({
    action: 'staff.update_role',
    resourceType: 'staff_user',
    resourceId: id,
    metadata: { role, admin_id: admin.id },
  })
  revalidatePath('/admin/settings')
}

export async function toggleFeatureFlag(formData: FormData) {
  const admin = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const enabled = formData.get('enabled') === 'true'
  if (!id) throw new Error('Missing feature flag id')

  const supabase = await supabaseForMutation()
  const { error } = await supabase
    .from('feature_flags')
    .update({ enabled, updated_by_staff_id: admin.id })
    .eq('id', id)
  if (error) throw error

  await logStaffAction({
    action: 'feature_flag.toggle',
    resourceType: 'feature_flag',
    resourceId: id,
    metadata: { enabled },
  })
  revalidatePath('/admin/settings')
}
