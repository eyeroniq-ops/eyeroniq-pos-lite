'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DateTimeDisplay({ className = '' }: { className?: string }) {
    const [mounted, setMounted] = useState(false)
    const [date, setDate] = useState<Date | null>(null)

    useEffect(() => {
        setMounted(true)
        setDate(new Date())

        const timer = setInterval(() => {
            setDate(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    if (!mounted || !date) return null

    return (
        <div className={`text-center ${className}`}>
            <div className="text-sm font-medium capitalize">
                {format(date, "EEEE d 'de' MMMM", { locale: es })}
            </div>
            <div className="text-xl font-bold font-mono">
                {format(date, "h:mm aa")}
            </div>
        </div>
    )
}
