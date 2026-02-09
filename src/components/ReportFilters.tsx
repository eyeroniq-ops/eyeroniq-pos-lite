'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ReportFilters({ users }: { users?: { id: string; name: string }[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const [year, setYear] = useState(searchParams.get('year') || currentYear.toString())
    const [month, setMonth] = useState(searchParams.get('month') || currentMonth.toString())
    const [userId, setUserId] = useState(searchParams.get('userId') || 'all')

    // Update state when URL params change (e.g. back button or external link)
    useEffect(() => {
        setYear(searchParams.get('year') || currentYear.toString())
        setMonth(searchParams.get('month') || currentMonth.toString())
        setUserId(searchParams.get('userId') || 'all')
    }, [searchParams])

    // Auto-update when year/month/user changes (debounced/effect)
    useEffect(() => {
        const params = new URLSearchParams()
        // Only push if different from current
        const currentYearParam = searchParams.get('year')
        const currentMonthParam = searchParams.get('month')
        const currentUserIdParam = searchParams.get('userId')

        if (year !== currentYearParam || month !== currentMonthParam || userId !== (currentUserIdParam || 'all')) {
            params.set('year', year)
            params.set('month', month)
            if (userId !== 'all') {
                params.set('userId', userId)
            }
            router.push(`${pathname}?${params.toString()}`)
        }
    }, [year, month, userId, pathname, router, searchParams])

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-end bg-[var(--color-secondary)] p-4 rounded-xl border border-white/5 w-fit">
            <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Año</label>
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full sm:w-auto bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                    {[2024, 2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Mes</label>
                <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full sm:w-auto bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('es', { month: 'long' })}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Empleado</label>
                <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full sm:w-auto bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                    <option value="all">Reporte General</option>
                    {users?.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}
