'use client'

import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { createBrowserSupabase } from '@/lib/supabase/client'
import type { NotificationPreferences } from '@/lib/supabase/types'
import { useAuth } from '@clerk/nextjs'
import { useState } from 'react'

export function SettingsPreferences({
  clientId,
  initial,
}: {
  clientId: string
  initial: NotificationPreferences | null
}) {
  const { getToken } = useAuth()
  const [prefs, setPrefs] = useState({
    email_notifications: initial?.email_notifications ?? true,
    message_alerts: initial?.message_alerts ?? true,
    invoice_reminders: initial?.invoice_reminders ?? true,
    document_uploads: initial?.document_uploads ?? false,
  })

  async function patch(partial: Partial<typeof prefs>) {
    const next = { ...prefs, ...partial }
    setPrefs(next)
    const token = await getToken({ template: 'supabase' })
    const sb = createBrowserSupabase(token)
    if (!sb) return
    await sb.from('notification_preferences').upsert(
      {
        client_id: clientId,
        email_notifications: next.email_notifications,
        message_alerts: next.message_alerts,
        invoice_reminders: next.invoice_reminders,
        document_uploads: next.document_uploads,
      },
      { onConflict: 'client_id' },
    )
  }

  return (
    <Card>
      <p className="iw-label mb-3">Notification preferences</p>
      <div className="space-y-4">
        <Toggle
          label="Email notifications"
          checked={prefs.email_notifications}
          onChange={(e) => void patch({ email_notifications: e.target.checked })}
        />
        <Toggle
          label="Message alerts"
          checked={prefs.message_alerts}
          onChange={(e) => void patch({ message_alerts: e.target.checked })}
        />
        <Toggle
          label="Invoice reminders"
          checked={prefs.invoice_reminders}
          onChange={(e) => void patch({ invoice_reminders: e.target.checked })}
        />
        <Toggle
          label="Document uploads"
          checked={prefs.document_uploads}
          onChange={(e) => void patch({ document_uploads: e.target.checked })}
        />
      </div>
    </Card>
  )
}
