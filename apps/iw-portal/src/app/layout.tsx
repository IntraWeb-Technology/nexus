import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, JetBrains_Mono } from 'next/font/google'
import ClerkProviderFromRequest from '@/components/auth/ClerkProviderFromRequest'
import { ThemeProvider } from '@/contexts/theme-context'
import { clerkAfterSignOutUrl, clerkProviderSatelliteProps, clerkSatelliteConfigured } from '@/lib/clerk-satellite'
import { portalThemeBootScript } from '@/lib/theme-storage'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'IntraWeb OS — Client Portal',
  description: 'IntraWeb Technologies LLC client project dashboard',
}

/** Next.js 16: viewport must be a separate export (not inside metadata). */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const clerkInner = clerkSatelliteConfigured() ? (
    <ClerkProviderFromRequest>{children}</ClerkProviderFromRequest>
  ) : (
    <ClerkProvider {...clerkProviderSatelliteProps('')} afterSignOutUrl={clerkAfterSignOutUrl()}>
      {children}
    </ClerkProvider>
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetBrainsMono.variable} min-h-screen antialiased`}>
        <script
          // Runs before paint; keeps `data-theme` aligned with localStorage (issue #2).
          dangerouslySetInnerHTML={{ __html: portalThemeBootScript() }}
        />
        <ThemeProvider>{clerkInner}</ThemeProvider>
      </body>
    </html>
  )
}
