import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { DM_Sans } from 'next/font/google'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} min-h-screen antialiased`}>
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" afterSignOutUrl="/sign-in">
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
