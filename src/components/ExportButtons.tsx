'use client'

import { FileText, Download } from 'lucide-react'

export default function ExportButtons({ year, month, userId }: { year: number, month: number, userId?: string }) {

    const handleExport = (format: 'csv' | 'pdf') => {
        const query = new URLSearchParams({
            format,
            year: year.toString(),
            month: month.toString(),
            userId: userId || 'all'
        })
        window.open(`/api/reports/export?${query.toString()}`, '_blank')
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-[var(--color-text)] rounded-lg text-sm font-medium transition-colors border border-white/5"
            >
                <Download className="h-4 w-4" />
                CSV
            </button>
            <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--color-primary)] hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
            >
                <FileText className="h-4 w-4" />
                PDF
            </button>
        </div>
    )
}
