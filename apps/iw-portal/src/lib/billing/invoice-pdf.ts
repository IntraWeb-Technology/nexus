import type { Invoice } from '@/lib/supabase/types'
import PDFDocument from 'pdfkit'

function collectBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}

export async function renderInvoicePdf(params: {
  invoice: Invoice
  projectSlug: string
  clientName: string
}): Promise<Buffer> {
  const { invoice, projectSlug, clientName } = params
  const doc = new PDFDocument({
    size: 'LETTER',
    margin: 56,
    info: { Title: `Invoice ${invoice.invoice_number}` },
  })
  const done = collectBuffer(doc)

  doc.fontSize(18).text('Invoice', { underline: true })
  doc.moveDown(0.5)
  doc.fontSize(10).fillColor('#333333')
  doc.text(`Invoice number: ${invoice.invoice_number}`)
  doc.text(`Project: ${projectSlug}`)
  doc.text(`Bill to: ${clientName}`)
  doc.text(`Status: ${invoice.status}`)
  doc.text(
    `Amount: ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (invoice.currency ?? 'usd').toUpperCase(),
    }).format(invoice.amount_cents / 100)}`,
  )
  if (invoice.due_date) doc.text(`Due date: ${invoice.due_date}`)
  doc.moveDown()
  doc.fontSize(11).fillColor('#111111').text('Description', { underline: true })
  doc.fontSize(9).fillColor('#333333').text(invoice.description || 'Service invoice', { align: 'left' })
  doc.end()

  return done
}
