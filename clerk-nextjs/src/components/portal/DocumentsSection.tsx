'use client'

import { DocumentList } from '@/components/portal/DocumentList'
import { FileUploadZone } from '@/components/portal/FileUploadZone'
import { SignatureModal } from '@/components/portal/SignatureModal'
import type { Document } from '@/lib/supabase/types'
import { useCallback, useState } from 'react'

export function DocumentsSection({ initialDocuments }: { initialDocuments: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [signTarget, setSignTarget] = useState<Document | null>(null)
  const [signOpen, setSignOpen] = useState(false)

  const onUploaded = useCallback((doc: Document) => {
    setDocuments((prev) => [doc, ...prev])
  }, [])

  const onSigned = useCallback((doc: Document) => {
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)))
  }, [])

  return (
    <div className="relative">
      <DocumentList
        documents={documents}
        onRequestSign={(d) => {
          setSignTarget(d)
          setSignOpen(true)
        }}
      />
      <div className="mt-4">
        <FileUploadZone onUploaded={onUploaded} />
      </div>
      {signOpen && signTarget ? (
        <div
          className="absolute inset-0 z-10 flex min-h-[240px] items-center justify-center rounded-[12px] bg-black/50 p-4"
          aria-hidden={!signOpen}
        >
          <SignatureModal
            document={signTarget}
            open={signOpen}
            onClose={() => {
              setSignOpen(false)
              setSignTarget(null)
            }}
            onSigned={onSigned}
          />
        </div>
      ) : null}
    </div>
  )
}
