'use client'

import { DocumentList } from '@/components/portal/DocumentList'
import { FileUploadZone } from '@/components/portal/FileUploadZone'
import { SignatureModal } from '@/components/portal/SignatureModal'
import type { Document } from '@/lib/supabase/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function DocumentsSection({ initialDocuments }: { initialDocuments: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [signTarget, setSignTarget] = useState<Document | null>(null)
  const [signOpen, setSignOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const modalWrapRef = useRef<HTMLDivElement>(null)

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

  // Escape key closes modal; Tab key is trapped within the modal panel (WCAG 2.1.2)
  useEffect(() => {
    if (!signOpen) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal()
        return
      }
      if (e.key === 'Tab') {
        const wrap = modalWrapRef.current
        if (!wrap) return
        const focusable = Array.from(wrap.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [signOpen, closeModal])

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
            {/* Modal panel — ref used by the focus trap */}
            <div ref={modalWrapRef} className="relative z-10 w-full max-w-md">
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
