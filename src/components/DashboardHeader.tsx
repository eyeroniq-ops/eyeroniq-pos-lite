'use client'

import { useTheme } from '@/components/ThemeProvider'

export default function DashboardHeader() {
    const { theme } = useTheme()
    return (
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            Bienvenido a {theme.businessName || 'eyeroniq'}
        </h1>
    )
}
