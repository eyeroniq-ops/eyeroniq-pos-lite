import Link from 'next/link'
import { getProducts, deleteProduct } from '@/actions/product'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

export default async function ProductsPage({
    searchParams,
}: {
    searchParams?: { query?: string }
}) {
    const { query = '' } = await searchParams || {}
    const products = await getProducts(query)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">Inventario</h1>
                    <p className="text-[var(--color-text-muted)]">Gestiona productos y servicios</p>
                </div>
                <Link
                    href="/products/new"
                    className="bg-[var(--color-primary)] hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-fit"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Item
                </Link>
            </div>

            <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-gray-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
                        <thead className="bg-black/20 text-[var(--color-text)] uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3 text-right">Precio</th>
                                <th className="px-6 py-3 text-right">Stock</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[var(--color-text)]">{product.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.type === 'SERVICE'
                                            ? 'bg-purple-500/10 text-purple-400'
                                            : 'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                            {product.type === 'SERVICE' ? 'SERVICIO' : 'PRODUCTO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-[var(--color-text)]">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-[var(--color-text)]">
                                        {product.type === 'SERVICE' ? '-' : product.stock}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/products/${product.id}`}
                                                className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <form action={async () => {
                                                'use server'
                                                await deleteProduct(product.id)
                                            }}>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                                        No se encontraron items.
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
