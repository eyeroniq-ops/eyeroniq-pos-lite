import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'eyeroniq PoS Lite',
  description: 'Point of Sale System',
}

import { ThemeProvider } from '@/components/ThemeProvider'

import { getSettings } from '@/actions/settings'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  // Transform settings to Theme format
  const initialTheme = {
    businessName: settings?.storeName || 'eyeroniq PoS Lite',
    logoUrl: settings?.storeLogoUrl || '', // Ensure it's string
    // default colors
    primary: '#318AD8',
    secondary: '#ebebeb',
    accent: '#0042aa',
    background: '#ffffff',
    // Map other optional fields
    location: settings?.storeAddress || '',
    phone: settings?.storePhone || '',
  }

  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider initialTheme={initialTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
