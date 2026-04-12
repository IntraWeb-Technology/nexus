import { ChangeOrdersSection } from '@/components/portal/ChangeOrdersSection'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { ChangeOrderRow } from '@/lib/supabase/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scope changes',
}

export default async function ChangeOrdersPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />

  const { data } = await supabase
    .from('change_orders')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as ChangeOrderRow[]
  return <ChangeOrdersSection initialRows={rows} />
}
