/**
 * Stripe subscription prices for portal "maintenance packages".
 *
 * Configure in env as JSON (array of packages):
 *   STRIPE_MAINTENANCE_PACKAGES=[{"id":"essential","name":"Essential Care","plan_slugs":["growth"],"description":"...","price_id":"price_xxx",...}]
 *
 * `plan_slugs`: optional string[] — if omitted, empty, or contains "*", the package is shown for any project.
 * Otherwise the project's `portal_plan_slug` (from HubSpot) must match one entry (case-insensitive).
 *
 * Shown in the portal: id, name, description, display price, features. `price_id` is server-only for checkout.
 */

export type MaintenancePackage = {
  id: string
  name: string
  description: string
  price_id: string
  /** If omitted or empty or includes "*", eligible for all projects. Else must match projects.portal_plan_slug. */
  plan_slugs?: string[]
  /** If set, shown as the main price; otherwise `price_label` or checkout-only. */
  price_cents?: number
  /** ISO currency for price_cents, default usd */
  currency?: string
  /** e.g. "per month" — short line under the amount */
  billing_note?: string
  /** One-line price when you do not use price_cents (e.g. "Custom") */
  price_label?: string
  /** Bullet list under "You're entitled to" */
  features: string[]
}

export type MaintenancePackagePublic = Pick<
  MaintenancePackage,
  'id' | 'name' | 'description' | 'price_cents' | 'currency' | 'billing_note' | 'price_label' | 'features'
>

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string' && Boolean(x.trim())).map((s) => s.trim())
}

function parsePackagesJson(raw: string | undefined): MaintenancePackage[] {
  const s = raw?.trim()
  if (!s) return []
  try {
    const data = JSON.parse(s) as unknown
    if (!Array.isArray(data)) return []
    const out: MaintenancePackage[] = []
    for (const item of data) {
      if (!item || typeof item !== 'object') continue
      const o = item as Record<string, unknown>
      const id = typeof o.id === 'string' ? o.id.trim() : ''
      const name = typeof o.name === 'string' ? o.name.trim() : ''
      const description = typeof o.description === 'string' ? o.description.trim() : ''
      const price_id = typeof o.price_id === 'string' ? o.price_id.trim() : ''
      if (!id || !name || !price_id) continue
      let features = asStringArray(o.features)
      if (features.length === 0) {
        features = asStringArray(o.entitlements)
      }
      const price_cents = typeof o.price_cents === 'number' && Number.isFinite(o.price_cents) ? o.price_cents : undefined
      const currency = typeof o.currency === 'string' && o.currency.trim() ? o.currency.trim().toLowerCase() : 'usd'
      const billing_note =
        typeof o.billing_note === 'string' && o.billing_note.trim() ? o.billing_note.trim() : 'per month'
      const price_label = typeof o.price_label === 'string' ? o.price_label.trim() : undefined
      let plan_slugs = asStringArray(o.plan_slugs)
      if (plan_slugs.length === 0) {
        plan_slugs = asStringArray(o.planSlugs)
      }
      out.push({
        id,
        name,
        description: description || name,
        price_id,
        ...(plan_slugs.length > 0 ? { plan_slugs } : {}),
        ...(price_cents !== undefined ? { price_cents, currency, billing_note } : {}),
        ...(price_cents === undefined && price_label ? { price_label } : {}),
        features,
      })
    }
    return out
  } catch {
    return []
  }
}

export function getMaintenancePackagesFromEnv(): MaintenancePackage[] {
  return parsePackagesJson(process.env.STRIPE_MAINTENANCE_PACKAGES)
}

export function maintenancePackagesForPortal(packages: MaintenancePackage[]): MaintenancePackagePublic[] {
  return packages.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price_cents: p.price_cents,
    currency: p.currency ?? 'usd',
    billing_note: p.billing_note,
    price_label: p.price_label,
    features: p.features,
  }))
}

export function findMaintenancePackageById(
  packages: MaintenancePackage[],
  packageId: string,
): MaintenancePackage | null {
  const id = packageId.trim()
  if (!id) return null
  return packages.find((p) => p.id === id) ?? null
}

export function normalizeMaintenancePlanSlug(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const s = String(raw).trim().toLowerCase()
  return s || null
}

function packagePlanSlugSet(pkg: MaintenancePackage): string[] | null {
  const list = pkg.plan_slugs
  if (!list || list.length === 0) return null
  return list.map((s) => s.trim().toLowerCase()).filter(Boolean)
}

/** Universal packages: no plan_slugs, empty, or wildcard "*". */
export function maintenancePackageIsUniversallyEligible(pkg: MaintenancePackage): boolean {
  const set = packagePlanSlugSet(pkg)
  if (set == null) return true
  return set.includes('*')
}

/**
 * Whether this package may be shown or checked out for the given project plan slug.
 * Restricted packages require a non-null project slug that matches (case-insensitive).
 */
export function maintenancePackageEligibleForPlanSlug(
  pkg: MaintenancePackage,
  projectPlanSlug: string | null | undefined,
): boolean {
  if (maintenancePackageIsUniversallyEligible(pkg)) return true
  const set = packagePlanSlugSet(pkg)
  if (!set) return true
  const proj = normalizeMaintenancePlanSlug(projectPlanSlug ?? null)
  if (!proj) return false
  return set.includes(proj)
}

export function filterMaintenancePackagesByPlanSlug(
  packages: MaintenancePackage[],
  projectPlanSlug: string | null | undefined,
): MaintenancePackage[] {
  return packages.filter((p) => maintenancePackageEligibleForPlanSlug(p, projectPlanSlug))
}
