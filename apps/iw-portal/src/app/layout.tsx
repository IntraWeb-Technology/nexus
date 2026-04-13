import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { DM_Sans } from 'next/font/google'
import { ThemeProvider } from '@/contexts/theme-context'
import { clerkAfterSignOutUrl, clerkProviderSatelliteProps } from '@/lib/clerk-satellite'
import { portalThemeBootScript } from '@/lib/theme-storage'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} min-h-screen antialiased`}>
        <script
          // Runs before paint; keeps `data-theme` aligned with localStorage (issue #2).
          dangerouslySetInnerHTML={{ __html: portalThemeBootScript() }}
        />
        <ThemeProvider>
          <ClerkProvider {...clerkProviderSatelliteProps()} afterSignOutUrl={clerkAfterSignOutUrl()}>
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
