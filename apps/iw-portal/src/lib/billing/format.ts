const MS_PER_DAY = 86400000

export function formatCurrency(cents: number, currency: string): string {
  const code = (currency || 'usd').toUpperCase()
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(cents / 100)
}

export function formatInvoiceDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Relative copy from `target` to `now`. `isWarn` when due within 7 days (future) or any past due.
 */
export function formatRelativeDate(target: Date, now = new Date()): { text: string; isWarn: boolean } {
  const startOf = (d: Date) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x.getTime()
  }
  const t0 = startOf(now)
  const t1 = startOf(target)
  const diffDays = Math.round((t1 - t0) / MS_PER_DAY)

  if (diffDays === 0) return { text: 'Today', isWarn: true }
  if (diffDays > 0) {
    const isWarn = diffDays <= 7
    if (diffDays === 1) return { text: 'In 1 day', isWarn }
    return { text: `In ${diffDays} days`, isWarn }
  }
  const past = -diffDays
  return { text: past === 1 ? '1 day ago' : `${past} days ago`, isWarn: true }
}

export function parseDueDateToStartOfDay(isoOrYmd: string | null | undefined): Date | null {
  if (!isoOrYmd) return null
  const s = isoOrYmd.trim()
  if (!s) return null
  const d = new Date(s.length <= 10 ? `${s}T12:00:00` : s)
  if (Number.isNaN(d.getTime())) return null
  return d
}
