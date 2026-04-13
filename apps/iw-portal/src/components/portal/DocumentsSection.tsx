'use client'

import { DocumentList } from '@/components/portal/DocumentList'
import { FileUploadZone } from '@/components/portal/FileUploadZone'
import { SignatureModal } from '@/components/portal/SignatureModal'
import type { Document } from '@/lib/supabase/types'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function DocumentsSection({ initialDocuments }: { initialDocuments: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [signTarget, setSignTarget] = useState<Document | null>(null)
  const [signOpen, setSignOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const onUploaded = useCallback((doc: Document) => {
    setDocuments((prev) => [doc, ...prev])
  }, [])

  const onSigned = useCallback((doc: Document) => {
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)))
  }, [])

  const closeModal = useCallback(() => {
    setSignOpen(false)
    setSignTarget(null)
  }, [])

  const modal =
    mounted && signOpen && signTarget
      ? createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal()
            }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
            {/* Modal */}
            <div className="relative z-10 w-full max-w-md">
              <SignatureModal
                document={signTarget}
                open={signOpen}
                onClose={closeModal}
                onSigned={onSigned}
              />
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div className="space-y-4">
        <DocumentList
          documents={documents}
          onRequestSign={(d) => {
            setSignTarget(d)
            setSignOpen(true)
          }}
        />
        <FileUploadZone onUploaded={onUploaded} />
      </div>
      {modal}
    </>
  )
}
