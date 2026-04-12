import { DocumentsSection } from '@/components/portal/DocumentsSection'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Document } from '@/lib/supabase/types'
import { DocumentRequestForm } from './request-form'

export default async function DocumentsPage() {
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('created_at', { ascending: false })
  const documents = (data ?? []) as Document[]

  return (
    <div className="space-y-6">
      <h1>Documents</h1>
      <DocumentsSection initialDocuments={documents} />
      <div className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4">
        <p className="iw-label mb-2">Request a document</p>
        <p className="mb-3 text-sm text-[var(--iw-text-2)]">
          Need something uploaded or a template shared? Send a request — our team is notified via automation.
        </p>
        <DocumentRequestForm />
      </div>
    </div>
  )
}
