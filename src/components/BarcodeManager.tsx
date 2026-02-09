'use client'

import { useState } from 'react'
import Barcode from 'react-barcode'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Printer, Search, RefreshCw, Plus, Wand2, RefreshCcw } from 'lucide-react'
import { generateProductBarcode, generateBatchBarcodes } from '@/actions/product'
import { useRouter } from 'next/navigation'

// Define Product type locally since we don't have a shared type file easily accessible yet, or update to import from Prisma
type Product = {
    id: string
    name: string
    price: number
    barcode: string | null
}

export default function BarcodeManager({ products }: { products: Product[] }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [search, setSearch] = useState('')
    const [mode, setMode] = useState<'barcode' | 'qr'>('barcode')
    const [generating, setGenerating] = useState<string | null>(null)
    const router = useRouter()

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
    )

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const selectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredProducts.map(p => p.id))
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const handleGenerate = async (e: React.MouseEvent, product: Product) => {
        e.stopPropagation()

        const isUpdate = !!product.barcode
        const message = isUpdate
            ? '¿Estás seguro de que deseas regenerar el código de barras? El código anterior se perderá.'
            : '¿Generar un nuevo código de barras para este producto?'

        if (!confirm(message)) return

        setGenerating(product.id)
        try {
            await generateProductBarcode(product.id)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error al generar código')
        } finally {
            setGenerating(null)
        }
    }

    const selectedProducts = products.filter(p => selectedIds.includes(p.id))

    const handleBulkGenerate = async (force: boolean) => {
        if (selectedIds.length === 0) return

        const message = force
            ? `ADVERTENCIA: Se regenerarán los códigos de ${selectedIds.length} productos seleccionados. Los códigos anteriores dejarán de funcionar. ¿Estás seguro?`
            : `Se generarán códigos para los productos seleccionados que NO tengan uno actualmente. ¿Continuar?`

        if (!confirm(message)) return

        setGenerating('bulk')
        try {
            const result = await generateBatchBarcodes(selectedIds, force)
            alert(`Se generaron ${result.count} códigos exitosamente.`)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error en generación masiva')
        } finally {
            setGenerating(null)
        }
    }

    return (
        <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center print:hidden shrink-0">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-9 pr-4 py-2 bg-[var(--color-secondary)] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-gray-500 text-[var(--color-text)]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex rounded-lg bg-[var(--color-secondary)] p-1 border border-white/10">
                        <button
                            onClick={() => setMode('barcode')}
                            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${mode === 'barcode' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Código de Barras
                        </button>
                        <button
                            onClick={() => setMode('qr')}
                            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${mode === 'qr' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            QR
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkGenerate(false)}
                            disabled={selectedIds.length === 0 || generating !== null}
                            className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Generar solo para los que no tienen código"
                        >
                            <Wand2 className="w-4 h-4" />
                            <span className="hidden lg:inline">Generar Faltantes</span>
                        </button>
                        <button
                            onClick={() => handleBulkGenerate(true)}
                            disabled={selectedIds.length === 0 || generating !== null}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Regenerar TODOS los seleccionados (Sobreescribe)"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            <span className="hidden lg:inline">Regenerar Todo</span>
                        </button>
                    </div>

                    <button
                        onClick={handlePrint}
                        disabled={selectedIds.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir ({selectedIds.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Selection List */}
                <div className="flex-1 bg-[var(--color-secondary)] border border-white/5 rounded-xl overflow-hidden flex flex-col print:hidden">
                    <div className="p-4 border-b border-white/5 flex items-center gap-3 shrink-0">
                        <input
                            type="checkbox"
                            checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
                            onChange={selectAll}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="text-sm font-medium text-gray-400">Seleccionar Todo</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                className={`p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${selectedIds.includes(product.id) ? 'bg-white/5' : ''}`}
                                onClick={() => toggleSelect(product.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(product.id)}
                                        onChange={() => { }} // Handled by div click
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                    />
                                    <div>
                                        <p className="font-medium text-[var(--color-text)]">{product.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-[var(--color-text-muted)]">${product.price.toFixed(2)} - {product.barcode || 'Sin Código'}</p>
                                            <button
                                                onClick={(e) => handleGenerate(e, product)}
                                                disabled={generating === product.id}
                                                className="p-1 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded transition-colors disabled:opacity-50"
                                                title={product.barcode ? "Regenerar código" : "Generar código"}
                                            >
                                                {generating === product.id ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="h-3 w-3" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No se encontraron productos
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview & Print View */}
                <div className="flex-1 bg-[var(--color-secondary)]/50 border border-white/5 rounded-xl p-4 overflow-y-auto print:p-0 print:overflow-visible print:bg-transparent print:border-none print:w-full">
                    <div className="mb-4 text-sm text-[var(--color-text-muted)] font-medium print:hidden">
                        Vista Previa ({selectedIds.length})
                    </div>

                    {selectedProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 print:hidden">
                            <p>Selecciona productos para ver sus etiquetas</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-3 print:gap-4 print:w-full">
                            {selectedProducts.map(product => (
                                <div key={product.id} className="bg-white border border-gray-200 p-4 rounded flex flex-col items-center justify-center text-center page-break-inside-avoid shadow-sm print:shadow-none">
                                    <p className="font-bold text-black text-sm mb-1 truncate w-full">{product.name}</p>
                                    {mode === 'barcode' ? (
                                        <Barcode
                                            value={product.barcode || product.id}
                                            width={1.5}
                                            height={40}
                                            fontSize={12}
                                            displayValue={true}
                                            background="#ffffff"
                                            lineColor="#000000"
                                        />
                                    ) : (
                                        <div className="py-2">
                                            <QRCodeSVG
                                                value={product.barcode || product.id}
                                                size={100}
                                                fgColor="#000000"
                                                bgColor="#ffffff"
                                            />
                                        </div>
                                    )}
                                    <p className="font-bold text-black text-lg mt-1">${product.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: auto; }
                    body * {
                        visibility: hidden;
                    }
                    .print\\:w-full, .print\\:w-full * {
                        visibility: visible;
                    }
                    .print\\:w-full {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    /* Ensure text is black for printing */
                    .print\\:text-black {
                        color: black !important;
                    }
                }
            `}</style>
        </div>
    )
}
