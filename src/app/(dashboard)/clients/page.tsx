import Link from 'next/link'
import { getClients, deleteClient } from '@/actions/client'
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react'

export default async function ClientsPage({
    searchParams,
}: {
    searchParams?: { query?: string }
}) {
    const { query = '' } = await searchParams || {}
    const clients = await getClients(query)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">Clientes</h1>
                    <p className="text-[var(--color-text-muted)]">Gestiona tu base de clientes</p>
                </div>
                <Link
                    href="/clients/new"
                    className="bg-[var(--color-primary)] hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-fit"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Cliente
                </Link>
            </div>

            <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Buscar clientes..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-gray-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
                        <thead className="bg-black/20 text-[var(--color-text)] uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Contacto</th>
                                <th className="px-6 py-3">Dirección</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[var(--color-text)]">{client.name}</td>
                                    <td className="px-6 py-4 space-y-1">
                                        {client.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-[var(--color-accent)]" />
                                                <span>{client.email}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3 text-emerald-400" />
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {client.address && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3 text-[var(--color-text-muted)]" />
                                                <span className="truncate max-w-xs">{client.address}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/clients/${client.id}`}
                                                className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <form action={async () => {
                                                'use server'
                                                await deleteClient(client.id)
                                            }}>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                                        No se encontraron clientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
