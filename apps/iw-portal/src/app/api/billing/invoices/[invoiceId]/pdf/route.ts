import { renderInvoicePdf } from '@/lib/billing/invoice-pdf'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Invoice } from '@/lib/supabase/types'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function GET(
  _request: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  const { invoiceId } = await context.params
  if (!invoiceId) return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: client } = await supabase.from('clients').select('*').eq('clerk_user_id', userId).maybeSingle()
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data: inv, error } = await supabase.from('invoices').select('*').eq('id', invoiceId).maybeSingle()
  if (error || !inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const invoice = inv as Invoice
  const { data: project } = await supabase
    .from('projects')
    .select('slug,client_id')
    .eq('id', invoice.project_id)
    .maybeSingle()
  if (!project || project.client_id !== client.id) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const buf = await renderInvoicePdf({
    invoice,
    projectSlug: project.slug ?? '',
    clientName: client.name,
  })

  const filename = `${invoice.invoice_number.replace(/[^\w.-]+/g, '_')}.pdf`
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  })
}
