import { getSalesAnalytics } from '@/actions/sale'
import { getExpenses } from '@/actions/expense'
import { getUsers } from '@/actions/user'
import ReportFilters from '@/components/ReportFilters'
import ExportButtons from '@/components/ExportButtons'
import CancelSaleButton from '@/components/CancelSaleButton'
import { DollarSign, ShoppingCart, TrendingUp, FileText, Receipt, PieChart } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; year?: string; userId?: string }>
}) {
    const params = await searchParams
    const year = params?.year ? parseInt(params.year) : new Date().getFullYear()
    const month = params?.month ? parseInt(params.month) : new Date().getMonth() + 1
    const userId = params?.userId || 'all'

    // Fetch Data
    const { totalSales, count, byMethod, byDay, sales } = await getSalesAnalytics(month, year, userId)
    const expenses = await getExpenses(month, year)
    const users = await getUsers()

    // Calculate Financials
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
    const netProfit = totalSales - totalExpenses

    // Helper for currency
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">Reportes</h1>
                    <p className="text-[var(--color-text-muted)]">Análisis de ventas y desempeño</p>
                </div>
                <Suspense fallback={<div className="h-10 w-32 bg-white/5 rounded-lg animate-pulse" />}>
                    <div className="flex items-center gap-4">
                        <ExportButtons year={year} month={month} userId={userId !== 'all' ? userId : undefined} />
                        <ReportFilters users={users} />
                    </div>
                </Suspense>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                            <DollarSign className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Ingresos (Ventas)</p>
                            <h3 className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(totalSales)}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-500/10 rounded-lg">
                            <Receipt className="h-6 w-6 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Gastos Totales</p>
                            <h3 className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(totalExpenses)}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-lg">
                            <PieChart className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Utilidad Neta</p>
                            <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatCurrency(netProfit)}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Transacciones</p>
                            <h3 className="text-2xl font-bold text-[var(--color-text)]">{count}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Balance por Día</h3>
                    {/* Visual Chart with Income vs Expenses per day could go here, for now using existing sales bars */}
                    <div className="h-48 flex items-end gap-2">
                        {Object.entries(byDay).map(([day, amount]: [string, any]) => {
                            const heightPercent = Math.min((amount / (totalSales || 1)) * 100 * 3, 100) // Avoid div by zero
                            return (
                                <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div
                                        className="w-full bg-[var(--color-primary)]/50 hover:bg-[var(--color-primary)] rounded-t transition-all"
                                        style={{ height: `${heightPercent || 5}%` }}
                                    ></div>
                                    <span className="text-xs text-[var(--color-text-muted)]">{day}</span>
                                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs p-1 rounded whitespace-nowrap pointer-events-none">
                                        Ventas: {formatCurrency(amount)}
                                    </div>
                                </div>
                            )
                        })}
                        {Object.keys(byDay).length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                                Sin ventas para este mes
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[var(--color-text)]">Desglose Financiero</h3>
                        <span className="text-xs text-[var(--color-text-muted)]">
                            {new Date(year, month - 1).toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                            <span className="text-emerald-400 font-medium">Total Ingresos</span>
                            <span className="text-emerald-400 font-bold">{formatCurrency(totalSales)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-rose-500/5 rounded-lg border border-rose-500/10">
                            <span className="text-rose-400 font-medium">Total Egresos</span>
                            <span className="text-rose-400 font-bold">{formatCurrency(totalExpenses)}</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[var(--color-text)] font-medium">Ganancia Neta</span>
                            <span className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatCurrency(netProfit)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Sales List */}
            <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[var(--color-accent)]" />
                        Detalle de Ventas
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
                        <thead className="bg-black/20 text-[var(--color-text)] uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Método</th>
                                <th className="px-6 py-3">Artículos</th>
                                <th className="px-6 py-3">Vendedor</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-[var(--color-text)]">#{sale.id}</td>
                                    <td className="px-6 py-4">{format(new Date(sale.createdAt), 'dd MMM p', { locale: es })}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sale.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                                            sale.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {sale.status === 'COMPLETED' ? 'COMPLETADA' :
                                                sale.status === 'CANCELLED' ? 'CANCELADA' : sale.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {sale.items.map((item: any) => (
                                                <span key={item.id} className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                                    <span className="font-medium text-[var(--color-text)]">{item.quantity}x</span>
                                                    {item.product?.name || 'Item eliminado'}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{sale.user?.name || '-'}</td>
                                    <td className={`px-6 py-4 text-right font-medium ${sale.status === 'CANCELLED' ? 'line-through opacity-50' : 'text-[var(--color-text)]'}`}>
                                        {formatCurrency(sale.total)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {sale.status === 'COMPLETED' && (
                                            <CancelSaleButton saleId={sale.id} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {sales.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                                        No hay ventas registradas en este período.
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
