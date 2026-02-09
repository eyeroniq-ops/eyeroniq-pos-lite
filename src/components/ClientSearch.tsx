'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { getClients } from '@/actions/client'

export default function ClientSearch({ onSelect }: { onSelect: (client: any) => void }) {
    const [query, setQuery] = useState('')
    const [clients, setClients] = useState<any[]>([])
    const [filtered, setFiltered] = useState<any[]>([])
    const [selectedName, setSelectedName] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        getClients().then(setClients)
    }, [])

    useEffect(() => {
        if (!query) {
            setFiltered(clients.slice(0, 5))
            return
        }
        const lower = query.toLowerCase()
        setFiltered(clients.filter(c => c.name.toLowerCase().includes(lower) || c.email?.toLowerCase().includes(lower)).slice(0, 5))
    }, [query, clients])

    return (
        <div className="relative">
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <div className="relative">
                <input
                    type="text"
                    value={selectedName || query}
                    onChange={e => { setQuery(e.target.value); setSelectedName(''); setIsOpen(true) }}
                    onFocus={() => setIsOpen(true)}
                    // onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    placeholder="Buscar cliente..."
                    className="w-full p-2 pl-9 bg-black/20 rounded border border-white/10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            {isOpen && !selectedName && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto z-10">
                    {filtered.map(client => (
                        <button
                            key={client.id}
                            className="w-full text-left p-2 hover:bg-white/10 flex justify-between items-center"
                            onClick={() => {
                                onSelect(client)
                                setSelectedName(client.name)
                                setIsOpen(false)
                            }}
                        >
                            <span>{client.name}</span>
                            <span className="text-xs text-gray-500">{client.email || 'Sin email'}</span>
                        </button>
                    ))}
                    {filtered.length === 0 && <div className="p-2 text-center text-gray-500 text-sm">No encontrado</div>}
                </div>
            )}
        </div>
    )
}
