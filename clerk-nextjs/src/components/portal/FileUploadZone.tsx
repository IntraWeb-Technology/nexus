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

export function FileUploadZone({ onUploaded }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

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

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const f = e.dataTransfer.files?.[0]
      if (f) void uploadFile(f)
    },
    [uploadFile],
  )

  return (
    <div className="rounded-[12px] border border-[var(--iw-border)] border-dashed bg-[var(--iw-slate-3)] p-6">
      <p className="iw-label mb-2">Upload a file</p>
      <p className="mb-3 text-sm text-[var(--iw-text-2)]">
        PDF, Word, images, or ZIP — up to 10 MB. Drag and drop here or choose a file.
      </p>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-4 py-8 text-center text-sm text-[var(--iw-text-3)]"
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (
          <span className="text-[var(--iw-text)]">Uploading… {progress}%</span>
        ) : (
          <span>Drop files here or click to browse</span>
        )}
        {busy ? (
          <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-[var(--iw-slate-3)]">
            <div
              className="h-2 rounded-full bg-[var(--iw-teal)] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
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
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </div>
  )
}
