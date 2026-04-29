'use client'

import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function MarkNotificationsReadButton({ unreadCount }: { unreadCount: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (unreadCount <= 0) return null

  return (
    <Button
      type="button"
      variant="outline"
      loading={loading}
      onClick={async () => {
        setLoading(true)
        try {
          const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' })
          if (res.ok) router.refresh()
        } finally {
          setLoading(false)
        }
      }}
    >
      Mark all as read ({unreadCount})
    </Button>
  )
}
