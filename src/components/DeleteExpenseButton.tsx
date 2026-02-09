'use client'

import { deleteExpense } from '@/actions/expense'
import { Trash2 } from 'lucide-react'

export default function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
    const handleDelete = async () => {
        if (confirm('¿Estás seguro de eliminar este gasto?')) {
            await deleteExpense(expenseId)
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    )
}
