import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { DM_Sans } from 'next/font/google'
import { ThemeProvider } from '@/contexts/theme-context'
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
  // viewport-fit=cover enables env(safe-area-inset-*) for iPhone notch / home-indicator clearance
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
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
          <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" afterSignOutUrl="/sign-in">
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
