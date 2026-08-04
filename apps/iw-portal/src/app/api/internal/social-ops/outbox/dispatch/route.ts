import { dispatchOutboxBatch } from '@/lib/social-ops/outbox/dispatcher'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'

function authorizedForDispatch(request: Request): boolean {
  if (validateIntrawebSecret(request)) return true
  const cronSecret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  return Boolean(cronSecret && auth === `Bearer ${cronSecret}`)
}

export async function POST(request: Request) {
  if (!authorizedForDispatch(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await dispatchOutboxBatch()
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
