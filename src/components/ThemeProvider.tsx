'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface Theme {
    primary: string
    secondary: string
    accent: string
    background: string
    businessName: string
    logoUrl?: string
    location?: string
    phone?: string
    policy?: string
    slogan?: string
}

interface ThemeContextType {
    theme: Theme
    updateTheme: (newTheme: Partial<Theme>) => void
    resetTheme: () => void
}

const DEFAULT_THEME: Theme = {
    primary: '#318AD8', // User specified Primary
    secondary: '#ebebeb', // User specified Secondary (Panels)
    accent: '#0042aa',   // User specified Accent (Icons, Details)
    background: '#ffffff', // User specified Background
    businessName: 'eyeroniq PoS Lite',
    logoUrl: '',
    location: '',
    phone: '',
    policy: '',
    slogan: '',
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Helper to calculate brightness
function getContrastColor(hexColor: string) {
    // Remove hash
    const hex = hexColor.replace('#', '')
    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    // YIQ equation
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return yiq >= 128 ? '#171717' : '#f8fafc' // Black for light bg, White for dark bg
}

function getMutedColor(hexColor: string) {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    // If light bg (return dark muted), if dark bg (return light muted)
    return yiq >= 128 ? '#525252' : '#94a3b8'
}


export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode, initialTheme?: Partial<Theme> }) {
    const [theme, setTheme] = useState<Theme>(() => ({
        ...DEFAULT_THEME,
        ...initialTheme
    }))
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('eyeroniq-theme')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setTheme({ ...DEFAULT_THEME, ...parsed })
            } catch (e) {
                console.error("Failed to parse theme", e)
            }
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        const root = document.documentElement

        // Base colors
        root.style.setProperty('--color-primary', theme.primary)
        root.style.setProperty('--color-secondary', theme.secondary)
        root.style.setProperty('--color-accent', theme.accent)
        root.style.setProperty('--color-background', theme.background)

        // Auto Text Contrast based on Background
        const textColor = getContrastColor(theme.background)
        const textMuted = getMutedColor(theme.background)

        // For Sidebar (Secondary), we might need logic, but for now global text usually follows main background in single-mode apps.
        // If we wanted split, we'd need more vars. Let's stick to global based on background for consistency.
        // Improvement: We can check if Secondary is VERY different and maybe that would require scoped vars, 
        // but typically "Light Mode" or "Dark Mode" aligns both.

        root.style.setProperty('--color-text', textColor)
        root.style.setProperty('--color-text-muted', textMuted)

        localStorage.setItem('eyeroniq-theme', JSON.stringify(theme))
    }, [theme, mounted])

    const updateTheme = (newTheme: Partial<Theme>) => {
        setTheme(prev => ({ ...prev, ...newTheme }))
    }

    const resetTheme = () => {
        setTheme(DEFAULT_THEME)
    }

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
