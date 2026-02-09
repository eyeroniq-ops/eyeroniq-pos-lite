'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, updateClient } from '@/actions/client'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Client {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
}

export default function ClientForm({ client }: { client?: Client }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            if (client) {
                await updateClient(client.id, formData)
            } else {
                await createClient(formData)
            }
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">
                        {client ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h1>
                    <p className="text-[var(--color-text-muted)]">
                        {client ? 'Actualizar datos del cliente' : 'Registrar nuevo cliente'}
                    </p>
                </div>
                <Link
                    href="/clients"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Link>
            </div>

            <form action={handleSubmit} className="bg-[var(--color-secondary)] border border-white/10 rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Nombre Completo</label>
                        <input
                            name="name"
                            defaultValue={client?.name}
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Correo Electrónico</label>
                        <input
                            name="email"
                            type="email"
                            defaultValue={client?.email || ''}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Teléfono</label>
                        <input
                            name="phone"
                            type="tel"
                            defaultValue={client?.phone || ''}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Dirección</label>
                        <textarea
                            name="address"
                            defaultValue={client?.address || ''}
                            rows={3}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                            placeholder="Dirección completa..."
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[var(--color-primary)] hover:opacity-90 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? 'Guardando...' : 'Guardar Cliente'}
                    </button>
                </div>
            </form>
        </div>
    )
}
