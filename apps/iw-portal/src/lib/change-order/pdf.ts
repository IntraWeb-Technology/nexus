import fs from 'node:fs'
import path from 'node:path'
import type { ChangeOrderPayloadInput } from '@/lib/change-order/schema'
import { changeOrderLegalCopy } from '@/lib/change-order/changeOrderCopy'
import PDFDocument from 'pdfkit'

function logoPath(): string | null {
  const p = path.join(process.cwd(), 'public', 'IW-logo-q2.png')
  return fs.existsSync(p) ? p : null
}

function collectBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}

export async function renderChangeOrderPdf(params: {
  coNumber: string
  projectName: string
  clientName: string
  clientEmail: string
  submittedAtIso: string
  payload: ChangeOrderPayloadInput
}): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'LETTER',
    margin: 56,
    info: { Title: `Scope change request ${params.coNumber}` },
  })
  const done = collectBuffer(doc)

  const logo = logoPath()
  if (logo) {
    doc.image(logo, { width: 160 })
    doc.moveDown(0.75)
  }

  doc.fontSize(18).text('Scope change request', { underline: true })
  doc.moveDown(0.5)
  doc.fontSize(10).fillColor('#333333')
  doc.text(`Request reference: ${params.coNumber}`)
  doc.text(`Project: ${params.projectName}`)
  doc.text(`Client: ${params.clientName} (${params.clientEmail})`)
  doc.text(`Submitted (UTC): ${params.submittedAtIso}`)
  doc.moveDown()

  doc.fontSize(11).fillColor('#111111').text('Introduction', { underline: true })
  doc.fontSize(9).fillColor('#333333')
  for (const p of changeOrderLegalCopy.preamble) {
    doc.moveDown(0.35)
    doc.text(p, { align: 'justify' })
  }
  doc.moveDown()

  const blocks: [string, string][] = [
    ['Request title', params.payload.title],
    ['Agreement or SOW reference', params.payload.masterAgreementReference],
    ['What is in scope today', params.payload.currentScopeSummary],
    ['Requested change', params.payload.requestedScopeDetail],
    ['Why this matters for your business', params.payload.businessRationale],
    ['Timeline / schedule impact', params.payload.scheduleImpact],
    [
      'Budget or fee impact',
      `Type: ${params.payload.costImpactType}\n\n${params.payload.costImpactDescription}`,
    ],
    ['Proposed effective date', params.payload.proposedEffectiveDate],
    [
      'Authorized by',
      `${params.payload.authorizedSignerName}, ${params.payload.authorizedSignerTitle}`,
    ],
  ]

  for (const [label, body] of blocks) {
    if (doc.y > doc.page.height - 120) doc.addPage()
    doc.fontSize(10).fillColor('#111111').text(`${label}:`, { underline: false })
    doc.fontSize(9).fillColor('#333333').text(body, { align: 'left' })
    doc.moveDown(0.6)
  }

  doc.fontSize(11).fillColor('#111111').text('Confirmations', { underline: true })
  doc.moveDown(0.25)
  const acks = [
    changeOrderLegalCopy.ackAccuracy,
    changeOrderLegalCopy.ackAuthority,
    changeOrderLegalCopy.ackWrittenSupersedesVerbal,
    changeOrderLegalCopy.ackElectronicRecords,
  ]
  for (const a of acks) {
    doc.fontSize(9).fillColor('#111111').text(`☒ ${a.label}`, { continued: false })
    doc.fontSize(8).fillColor('#444444').text(a.detail, { indent: 12 })
    doc.moveDown(0.35)
  }

  doc.end()
  return done
}
