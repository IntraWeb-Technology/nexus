'use client'

import {
  isAllowedDocumentUpload,
  MAX_UPLOAD_BYTES,
  normalizeContentType,
} from '@/lib/documents/upload'
import type { Document } from '@/lib/supabase/types'
import { useCallback, useRef, useState } from 'react'

type FileUploadZoneProps = {
  onUploaded: (doc: Document) => void
}

function UploadIcon() {
  return (
    <svg
      className="mx-auto mb-3 text-[var(--iw-text-3)]"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.667 21.333C7.354 21.333 4.667 18.646 4.667 15.333c0-2.906 2-5.333 4.666-6 .32-3.013 2.854-5.333 5.947-5.333 2.4 0 4.48 1.44 5.493 3.52.32-.053.64-.053.96-.053 3.2 0 5.6 2.666 5.6 5.866 0 2.934-2.213 5.334-5.066 5.334"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 22.667 16 18.667l-4 4M16 18.667V28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FileUploadZone({ onUploaded }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null)
      setProgress(0)

      if (file.size > MAX_UPLOAD_BYTES) {
        setError('File must be 10 MB or smaller.')
        return
      }
      if (!isAllowedDocumentUpload(file.name)) {
        setError('This file type is not supported.')
        return
      }

      const contentType = normalizeContentType(file.type, file.name)
      if (!contentType) {
        setError('Could not determine file type.')
        return
      }

      setBusy(true)
      try {
        const initRes = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType }),
        })
        if (!initRes.ok) {
          setError('Could not start upload.')
          return
        }
        const init = (await initRes.json()) as {
          uploadUrl: string
          path: string
          token: string
          contentType: string
        }
        const putContentType = init.contentType

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', init.uploadUrl)
          xhr.setRequestHeader('Content-Type', putContentType)
          xhr.setRequestHeader('Authorization', `Bearer ${init.token}`)
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setProgress(Math.round((ev.loaded / ev.total) * 100))
            }
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve()
            else reject(new Error('upload failed'))
          }
          xhr.onerror = () => reject(new Error('network'))
          xhr.send(file)
        })

        const fileSizeKb = Math.max(1, Math.round(file.size / 1024))
        const confirmRes = await fetch('/api/documents/upload/confirm', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            path: init.path,
            name: file.name,
            fileSizeKb,
          }),
        })
        if (!confirmRes.ok) {
          setError('Uploaded but could not finalize. Contact support if this persists.')
          return
        }
        const confirm = (await confirmRes.json()) as { document: Document }
        onUploaded(confirm.document)
        setProgress(100)
      } catch {
        setError('Upload failed. Check your connection and try again.')
      } finally {
        setBusy(false)
      }
    },
    [onUploaded],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setDragging(false)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files?.[0]
      if (f) void uploadFile(f)
    },
    [uploadFile],
  )

  const dropZoneClass = [
    'flex cursor-pointer flex-col items-center justify-center rounded-[var(--iw-radius-control)] border-2 border-dashed px-4 py-10 text-center text-sm transition-[border-color,background-color] duration-200',
    dragging
      ? 'border-[var(--iw-teal)] bg-[var(--iw-teal-dim)]/10'
      : 'border-[var(--iw-border)] bg-[var(--iw-slate-2)] text-[var(--iw-text-3)] hover:border-[var(--iw-border-2)]',
  ].join(' ')

  return (
    <div className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-5">
      <p className="iw-label mb-1">Upload a file</p>
      <p className="mb-4 text-sm text-[var(--iw-text-2)]">
        PDF, Word, images, or ZIP — up to 10 MB.
      </p>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload file drop zone"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={dropZoneClass}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (
          <div className="w-full max-w-xs space-y-2">
            <p className="text-center text-sm font-medium text-[var(--iw-text)]">
              Uploading… {progress}%
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--iw-slate-3)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--iw-teal-dim)] to-[var(--iw-teal)] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <UploadIcon />
            <p className="font-medium text-[var(--iw-text-2)]">
              {dragging ? 'Drop to upload' : 'Drop files here or click to browse'}
            </p>
            <p className="mt-1 text-xs text-[var(--iw-text-3)]">PDF · DOCX · PNG · JPG · ZIP</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,application/zip"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) void uploadFile(f)
        }}
      />
      {error ? (
        <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm text-[var(--iw-red)]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  )
}
