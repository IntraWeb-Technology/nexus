'use client'

import Image from 'next/image'
import { useTheme } from '@/contexts/theme-context'

export function IwLogo({
  className = '',
  height = 28,
}: {
  className?: string
  height?: number
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Image
      src={isDark ? '/intraweb-logo-black-inverted.png' : '/intraweb-logo-light.png'}
      alt="IntraWeb Technologies"
      height={height}
      width={Math.round(height * (870 / 216))}
      className={className}
      priority
      suppressHydrationWarning
    />
  )
}
