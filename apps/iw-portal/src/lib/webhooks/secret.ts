import { timingSafeEqual } from 'node:crypto'

export function validateIntrawebSecret(request: Request): boolean {
  const got = request.headers.get('x-intrawebtech-secret')
  const want = process.env.WEBHOOK_SECRET
  if (!want || !got) return false
  
  // Use constant-time comparison to prevent timing attacks
  try {
    const gotBuf = Buffer.from(got, 'utf8')
    const wantBuf = Buffer.from(want, 'utf8')
    if (gotBuf.length !== wantBuf.length) return false
    return timingSafeEqual(gotBuf, wantBuf)
  } catch {
    return false
  }
}
