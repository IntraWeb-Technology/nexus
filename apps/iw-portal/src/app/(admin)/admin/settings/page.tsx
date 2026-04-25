import { AdminPageHeader, EmptyState, formatDate } from '@/components/admin/AdminPrimitives'
import { toggleFeatureFlag, updateStaffRole } from '@/lib/admin/actions'
import { getAdminSettings } from '@/lib/admin/queries'

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings()
  return (
    <div className="iw-page">
      <AdminPageHeader title="Settings" description="Staff roles and feature flags backed by Supabase authorization tables." />
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="iw-card">
          <h2 className="iw-card-title">Staff</h2>
          {settings.staff.length ? settings.staff.map((staff) => (
            <form key={staff.id} action={updateStaffRole} className="mt-3 grid gap-3 border-t border-[var(--hairline)] pt-3 first:border-0 first:pt-0 md:grid-cols-[1fr_140px_auto]">
              <input type="hidden" name="id" value={staff.id} />
              <div>
                <p className="font-medium">{staff.display_name || staff.email}</p>
                <p className="text-xs text-[var(--iw-text-3)]">{staff.email} · active {String(staff.is_active)} · {formatDate(staff.created_at)}</p>
              </div>
              <select name="role" defaultValue={staff.role} className="rounded-[var(--radius-ctrl)] border border-[var(--hairline)] bg-[var(--bg-2)] px-3 py-2 text-sm">
                <option value="admin">admin</option>
                <option value="ops">ops</option>
                <option value="support">support</option>
                <option value="viewer">viewer</option>
              </select>
              <button className="rounded-[var(--radius-ctrl)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white" type="submit">Save</button>
            </form>
          )) : <EmptyState>No staff users are configured. Bootstrap the first admin with the runbook/env flow.</EmptyState>}
        </section>
        <section className="iw-card">
          <h2 className="iw-card-title">Feature flags</h2>
          {settings.flags.length ? settings.flags.map((flag) => (
            <form key={flag.id} action={toggleFeatureFlag} className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--hairline)] pt-3 first:border-0 first:pt-0">
              <input type="hidden" name="id" value={flag.id} />
              <input type="hidden" name="enabled" value={String(!flag.enabled)} />
              <div>
                <p className="font-medium">{flag.flag_key}</p>
                <p className="text-xs text-[var(--iw-text-3)]">{flag.environment}</p>
              </div>
              <button className={flag.enabled ? 'iw-chip iw-chip-green' : 'iw-chip'} type="submit">
                {flag.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </form>
          )) : <EmptyState>No feature flags exist yet.</EmptyState>}
        </section>
      </div>
    </div>
  )
}
