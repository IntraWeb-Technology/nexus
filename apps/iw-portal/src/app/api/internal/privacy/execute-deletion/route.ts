import { executeDataDeletion } from '@/lib/privacy/execute-data-deletion'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 120

const bodySchema = z.object({
  request_id: z.string().uuid(),
  email: z.string().email(),
})

export async function POST(request: Request) {
  if (!validateIntrawebSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  try {
    const result = await executeDataDeletion({
      requestId: body.request_id,
      email: body.email.trim().toLowerCase(),
    })
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
