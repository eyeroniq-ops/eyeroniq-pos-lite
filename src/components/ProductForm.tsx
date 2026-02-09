'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/actions/product'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Product {
    id: string
    name: string
    description: string | null
    type: string
    price: number
    cost: number
    stock: number
}

export default function ProductForm({ product }: { product?: Product }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState(product?.type || 'PRODUCT')

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            if (product) {
                await updateProduct(product.id, formData)
            } else {
                await createProduct(formData)
            }
            // Redirect is handled in server action
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
                        {product ? 'Editar Ítem' : 'Nuevo Ítem'}
                    </h1>
                    <p className="text-[var(--color-text-muted)]">
                        {product ? 'Actualizar detalles' : 'Agregar nuevo producto o servicio'}
                    </p>
                </div>
                <Link
                    href="/products"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Link>
            </div>

            <form action={handleSubmit} className="bg-[var(--color-secondary)] border border-white/10 rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Nombre</label>
                        <input
                            name="name"
                            defaultValue={product?.name}
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                            placeholder="Ej: Servicio Premium"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Descripción</label>
                        <textarea
                            name="description"
                            defaultValue={product?.description || ''}
                            rows={3}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                            placeholder="Detalles opcionales..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Tipo</label>
                        <select
                            name="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="PRODUCT">Producto (Físico)</option>
                            <option value="SERVICE">Servicio (Digital/Mano de obra)</option>
                        </select>
                    </div>

                    {type === 'PRODUCT' && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Stock</label>
                            <input
                                name="stock"
                                type="number"
                                defaultValue={product?.stock || 0}
                                min="0"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Costo (Interno)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                            <input
                                name="cost"
                                type="number"
                                step="0.01"
                                defaultValue={product?.cost || 0}
                                min="0"
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Precio (Venta)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={product?.price || 0}
                                min="0"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[var(--color-primary)] hover:opacity-90 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? 'Guardando...' : 'Guardar Ítem'}
                    </button>
                </div>
            </form>
        </div>
    )
}
