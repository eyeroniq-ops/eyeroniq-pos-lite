import Link from 'next/link'
import { ShoppingCart, Package, Users, FileText, Settings, Receipt, Calendar } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { getSession } from '@/lib/auth'

export default async function DashboardPage() {
    const session = await getSession()
    const user = session?.user

    const allMenuItems = [
        { label: 'Ventas (POS)', icon: ShoppingCart, href: '/sales', color: 'text-emerald-600', bg: 'bg-emerald-500/10', borderColor: 'border-[#0042aa]', permission: 'sales' },
        { label: 'Inventario', icon: Package, href: '/products', color: 'text-indigo-600', bg: 'bg-indigo-500/10', borderColor: 'border-[#0042aa]', permission: 'products' },
        { label: 'Clientes', icon: Users, href: '/clients', color: 'text-blue-600', bg: 'bg-blue-500/10', borderColor: 'border-[#0042aa]', permission: 'clients' },
        { label: 'Reportes', icon: FileText, href: '/reports', color: 'text-purple-600', bg: 'bg-purple-500/10', borderColor: 'border-[#0042aa]', permission: 'reports' },
        { label: 'Gastos', icon: Receipt, href: '/expenses', color: 'text-rose-600', bg: 'bg-rose-500/10', borderColor: 'border-[#0042aa]', permission: 'expenses' },

    ]

    const menuItems = allMenuItems.filter(item => {
        if (user?.role === 'ADMIN') return true
        if (item.permission === 'any') return true
        return user?.permissions?.includes(item.permission)
    })

    return (
        <div className="space-y-8">
            <div>
                <DashboardHeader />
                <p className="text-[var(--color-text-muted)]">Selecciona una opción para comenzar</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`bg-[var(--color-secondary)] border-2 ${item.borderColor} rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-black/5 transition-all hover:-translate-y-1 hover:shadow-xl shadow-lg aspect-square group`}
                    >
                        <div className={`p-4 rounded-full ${item.bg} group-hover:scale-110 transition-transform`}>
                            <item.icon className={`h-10 w-10 ${item.color}`} />
                        </div>
                        <span className="text-lg font-medium text-[var(--color-text)]">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
