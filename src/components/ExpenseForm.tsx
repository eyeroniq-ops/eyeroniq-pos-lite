'use client'

import { useRef, useState } from 'react'
import { createExpense } from '@/actions/expense'
import { Plus } from 'lucide-react'

export default function ExpenseForm() {
    const formRef = useRef<HTMLFormElement>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        await createExpense(formData)
        formRef.current?.reset()
        setLoading(false)
    }

    return (
        <form ref={formRef} action={handleSubmit} className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Descripción</label>
                <input
                    name="description"
                    required
                    placeholder="Ej. Pago de Luz"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
            </div>

            <div className="w-full md:w-32">
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Monto</label>
                <input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
            </div>

            <div className="w-full md:w-40">
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Categoría</label>
                <select
                    name="category"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                    <option value="General">General</option>
                    <option value="Utilities">Servicios</option>
                    <option value="Rent">Alquiler</option>
                    <option value="Supplies">Insumos</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-[var(--color-primary)] hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
                <Plus className="h-5 w-5" />
                {loading ? '...' : 'Agregar'}
            </button>
        </form>
    )
}
