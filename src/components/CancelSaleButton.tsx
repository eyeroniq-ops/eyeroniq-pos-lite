'use client'

import { cancelSale } from '@/actions/sale'
import { XCircle } from 'lucide-react'

export default function CancelSaleButton({ saleId }: { saleId: number }) {
    const handleCancel = async () => {
        if (confirm('¿Estás seguro de cancelar esta venta? El stock será restaurado.')) {
            await cancelSale(saleId)
        }
    }

    return (
        <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-colors"
        >
            <XCircle className="h-3 w-3" />
            Cancelar
        </button>
    )
}
