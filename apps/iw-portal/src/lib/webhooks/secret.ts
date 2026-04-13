export function validateIntrawebSecret(request: Request): boolean {
  const got = request.headers.get('x-intrawebtech-secret')
  const want = process.env.WEBHOOK_SECRET
  return !!want && got === want
}
