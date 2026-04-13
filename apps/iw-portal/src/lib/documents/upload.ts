const ALLOWED_EXT = new Set(['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'zip'])

/** Max upload size in bytes (client and server validate). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function sanitizeUploadFileName(name: string): string {
  const trimmed = name.trim() || 'upload'
  const base = trimmed.replace(/^.*[/\\]/, '').replace(/[^\w.\-()+@ ]/g, '_')
  return base.slice(0, 180) || 'upload'
}

export function extensionLower(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

export function isAllowedDocumentUpload(filename: string): boolean {
  const ext = extensionLower(filename)
  return ALLOWED_EXT.has(ext)
}

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  zip: 'application/zip',
}

const ALLOWED_MIMES = new Set(Object.values(MIME_BY_EXT))

export function normalizeContentType(contentType: string, filename: string): string | null {
  const ct = contentType.split(';')[0]?.trim().toLowerCase() ?? ''
  if (ct && ALLOWED_MIMES.has(ct)) return ct
  const ext = extensionLower(filename)
  const byExt = MIME_BY_EXT[ext]
  return byExt ?? null
}

export function isPortalStorageObjectPath(path: string, projectId: string): boolean {
  if (!path || path.includes('..') || path.startsWith('/')) return false
  const first = path.split('/')[0]
  return first === projectId
}
