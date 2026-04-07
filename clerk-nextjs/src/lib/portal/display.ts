/** Client-facing formatting for CRM-backed fields (portal-only; no external CRM UI). */

export function formatUsdFromString(amount: string | null | undefined): string | null {
  if (amount == null || amount === '') return null
  const n = Number.parseFloat(String(amount))
  if (Number.isNaN(n)) return String(amount).trim() || null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function formatIsoDate(value: string | null | undefined): string | null {
  if (value == null || value === '') return null
  const t = Date.parse(value)
  if (Number.isNaN(t)) return value
  return new Date(t).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

export function truncateText(text: string | null | undefined, max: number): string | null {
  if (text == null || text === '') return null
  const s = text.trim()
  if (s.length <= max) return s
  return `${s.slice(0, Math.max(0, max - 1))}…`
}

/** HubSpot contact lifecycle internal values → readable labels */
export function formatLifecycleStage(raw: string | null | undefined): string | null {
  if (raw == null || raw === '') return null
  const key = raw.toLowerCase().replace(/\s+/g, '')
  const map: Record<string, string> = {
    subscriber: 'Subscriber',
    lead: 'Lead',
    marketingqualifiedlead: 'Marketing qualified lead',
    mql: 'Marketing qualified lead',
    salesqualifiedlead: 'Sales qualified lead',
    sql: 'Sales qualified lead',
    opportunity: 'Opportunity',
    customer: 'Customer',
    evangelist: 'Evangelist',
    other: 'Other',
  }
  return map[key] ?? raw
}
