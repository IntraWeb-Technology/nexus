/** Shown when the stored description is a placeholder. */
const GENERIC_DESCRIPTIONS = new Set(['', 'invoice', 'invoice.'])

export function isGenericInvoiceDescription(raw: string | null | undefined): boolean {
  const t = (raw || '').trim().toLowerCase()
  return GENERIC_DESCRIPTIONS.has(t)
}

function humanizeSku(sku: string): string {
  return sku.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || sku
}

/**
 * Picks a clear "what this charge is" title and optional subline (sku / reference).
 * Prefer real descriptions; fall back to SKU patterns; last resort a neutral label.
 */
export function buildInvoiceLineSummary(opts: {
  description: string
  sku: string | null | undefined
}): { title: string; detail: string | null } {
  const desc = (opts.description || '').trim()
  const sku = (opts.sku || '').trim()
  const generic = isGenericInvoiceDescription(desc)

  if (!generic) {
    return {
      title: desc,
      detail: sku ? `Item: ${humanizeSku(sku)}` : null,
    }
  }

  if (sku) {
    if (sku.toUpperCase().includes('MRR') || sku.toLowerCase().includes('retainer')) {
      return { title: 'Monthly retainer', detail: humanizeSku(sku) }
    }
    return { title: humanizeSku(sku), detail: null }
  }

  return {
    title: 'Service invoice',
    detail: 'Use the invoice number if you need to reference this charge with us.',
  }
}

export function formatDisplayDate(iso: string | null | undefined, empty = '—'): string {
  if (!iso) return empty
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return empty
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function dateFromYyyyMmDd(d: string | null | undefined): string | null {
  if (!d) return null
  const t = Date.parse(d.length <= 10 ? `${d}T12:00:00` : d)
  if (Number.isNaN(t)) return null
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
