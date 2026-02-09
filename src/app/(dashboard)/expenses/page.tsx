import { getExpenses } from '@/actions/expense'
import ExpenseForm from '@/components/ExpenseForm'
import DeleteExpenseButton from '@/components/DeleteExpenseButton'
import { Trash2, Receipt } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Suspense } from 'react'
import ReportFilters from '@/components/ReportFilters'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; year?: string }>
}) {
    const params = await searchParams
    const year = params?.year ? parseInt(params.year) : new Date().getFullYear()
    const month = params?.month ? parseInt(params.month) : new Date().getMonth() + 1

    const expenses = await getExpenses(month, year)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">Gastos</h1>
                    <p className="text-[var(--color-text-muted)]">Registro de costos operativos</p>
                </div>
                <Suspense fallback={<div className="h-10 w-32 bg-white/5 rounded-lg animate-pulse" />}>
                    <ReportFilters />
                </Suspense>
            </div>

            <ExpenseForm />

            <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
                    <thead className="bg-black/20 text-[var(--color-text)] uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3">Descripción</th>
                            <th className="px-6 py-3">Categoría</th>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Registrado Por</th>
                            <th className="px-6 py-3 text-right">Monto</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-[var(--color-text)] flex items-center gap-3">
                                    <div className="p-2 bg-black/20 rounded mx-0">
                                        <Receipt className="h-4 w-4 text-[var(--color-text-muted)]" />
                                    </div>
                                    {expense.description}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-black/20 text-[var(--color-text-muted)] px-2 py-1 rounded text-xs">
                                        {expense.category || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{format(new Date(expense.date), 'PPP', { locale: es })}</td>
                                <td className="px-6 py-4">{expense.user?.name || 'Desconocido'}</td>
                                <td className="px-6 py-4 text-right text-[var(--color-text)] font-medium">
                                    -${expense.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DeleteExpenseButton expenseId={expense.id} />
                                </td>
                            </tr>
                        ))}
                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                                    No hay gastos registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
