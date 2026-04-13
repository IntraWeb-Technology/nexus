import { DocumentsSection } from '@/components/portal/DocumentsSection'
import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { Card } from '@/components/ui/Card'
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
    <div className="iw-animate-slide-up space-y-6">
      <div>
        <h1>Documents</h1>
        <p className="mt-1 text-sm text-[var(--iw-text-2)]">
          View, download, and sign shared files for your project.
        </p>
      </div>

      <DocumentsSection initialDocuments={documents} />

      <Card>
        <p className="iw-label mb-1">Request a document</p>
        <p className="mb-4 text-sm text-[var(--iw-text-2)]">
          Need something uploaded or a template shared? Send a request — our team is notified
          automatically.
        </p>
        <DocumentRequestForm />
      </Card>
    </div>
  )
}
