'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import DateTimeDisplay from '@/components/DateTimeDisplay'

interface User {
    id: string
    name: string | null
    email: string
}

export default function LoginForm({ users }: { users: User[] }) {
    const router = useRouter()
    const { theme } = useTheme()

    // Default to first user if available, or empty
    const [selectedUserEmail, setSelectedUserEmail] = useState('')

    useEffect(() => {
        if (users.length > 0) {
            setSelectedUserEmail(users[0].email)
        }
    }, [users])

    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Ensure theme is loaded
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: selectedUserEmail, password }),
            })

            if (res.ok) {
                router.push('/')
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.error || 'Credenciales inválidas')
            }
        } catch (err) {
            setError('Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: theme.background }}
        >
            <div className="absolute top-4 right-4">
                <DateTimeDisplay className="text-[var(--color-text-muted)]" />
            </div>
            <div className="relative w-full max-w-md bg-[var(--color-secondary)] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8 flex flex-col items-center">
                    {theme.logoUrl ? (
                        <img
                            src={theme.logoUrl}
                            alt={theme.businessName}
                            className="h-16 w-auto max-w-[200px] object-contain mb-4"
                        />
                    ) : null}
                    <h1 className="text-3xl font-bold lowercase" style={{ color: theme.primary }}>
                        {theme.businessName}
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-2">Inicia sesión en tu cuenta</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                            Seleccionar Usuario
                        </label>
                        <select
                            value={selectedUserEmail}
                            onChange={(e) => setSelectedUserEmail(e.target.value)}
                            className="w-full bg-black/10 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-all appearance-none cursor-pointer"
                            required
                        >
                            <option value="" disabled>Selecciona un usuario</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.email}>
                                    {user.name || user.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                            Contraseña (PIN)
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/10 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] transition-all"
                            placeholder="••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white font-semibold py-3 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: theme.primary }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}
