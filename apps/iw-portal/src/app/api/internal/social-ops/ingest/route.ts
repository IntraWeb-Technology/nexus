import { ingestEditorialDraft } from '@/lib/social-ops/commands/ingest-editorial-draft'
import { ingestEditorialDraftSchema } from '@/lib/social-ops/schemas'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!validateIntrawebSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ingestEditorialDraftSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid command', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const result = await ingestEditorialDraft(parsed.data)
    return NextResponse.json(result, { status: result.idempotent_replay ? 200 : 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
