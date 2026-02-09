'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Users, Receipt, PieChart, LogOut, Menu, X, Settings, Calendar } from 'lucide-react'
import { useTheme } from './ThemeProvider' // Import context
import DateTimeDisplay from './DateTimeDisplay'


export default function DashboardLayout({ children, user }: { children: React.ReactNode, user?: any }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProModalOpen, setIsProModalOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { theme } = useTheme()

    const allMenuItems = [
        { name: 'Inicio', href: '/', icon: LayoutDashboard, permission: 'any' },
        { name: 'Ventas', href: '/sales', icon: ShoppingCart, permission: 'sales' },
        { name: 'Inventario', href: '/products', icon: Package, permission: 'products' },
        { name: 'Clientes', href: '/clients', icon: Users, permission: 'clients' },
        // { name: 'Citas', href: '/appointments', icon: Calendar, permission: 'any' },
        { name: 'Gastos', href: '/expenses', icon: Receipt, permission: 'expenses' },
        { name: 'Reportes', href: '/reports', icon: PieChart, permission: 'reports' },
        { name: 'Configuración', href: '/settings', icon: Settings, permission: 'settings' },
    ]

    const menuItems = allMenuItems.filter(item => {
        // Hide Appointments for everyone in Lite version
        if (item.name === 'Citas') return false

        if (user?.role === 'ADMIN') return true
        if (item.permission === 'any') return true
        return user?.permissions?.includes(item.permission)
    })

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
        router.refresh()
    }

    return (
        <>
            <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex">
                {/* Sidebar for Desktop */}
                <aside className="hidden md:flex flex-col w-64 bg-[var(--color-secondary)] border-r border-white/5">
                    <div className="p-6 flex flex-col items-center">
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] lowercase text-center">
                            {theme.businessName || 'eyeroniq PoS Lite'}
                        </h1>
                        <DateTimeDisplay className="mt-4 text-[var(--color-text-muted)]" />
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10'
                                        : 'hover:bg-white/5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-white/5 space-y-2">
                        <button
                            onClick={() => setIsProModalOpen(true)}
                            className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg shadow-lg hover:opacity-90 transition-all font-medium"
                        >
                            Actualizar a Pro
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Cerrar Sesión
                        </button>
                    </div>
                </aside>

                {/* Mobile Header & Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <header className="md:hidden flex items-center justify-between p-4 bg-[var(--color-secondary)] border-b border-white/5">
                        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] lowercase">
                            {theme.businessName || 'eyeroniq pos lite'}
                        </h1>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-white"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </header>

                    {/* Mobile Date Display */}
                    <div className="md:hidden bg-[var(--color-secondary)]/50 border-b border-white/5 py-2">
                        <DateTimeDisplay className="text-[var(--color-text-muted)] scale-90 origin-center" />
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden absolute inset-0 z-50 bg-[var(--color-background)]/95 backdrop-blur-3xl">
                            <div className="flex justify-end p-4">
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-[var(--color-text-muted)] hover:text-white"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <nav className="px-6 space-y-4 text-lg">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center px-4 py-4 rounded-xl ${pathname === item.href
                                            ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                                            : 'text-[var(--color-text-muted)]'
                                            }`}
                                    >
                                        <item.icon className="h-6 w-6 mr-4" />
                                        {item.name}
                                    </Link>
                                ))}
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false)
                                        setIsProModalOpen(true)
                                    }}
                                    className="flex items-center w-full px-4 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg font-medium"
                                >
                                    Actualizar a Pro
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-xl"
                                >
                                    <LogOut className="h-6 w-6 mr-4" />
                                    Cerrar Sesión
                                </button>
                            </nav>
                        </div>
                    )}

                    <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                        {children}
                    </main>
                </div>
            </div>

            {/* PRO MODAL */}
            {isProModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[var(--color-secondary)] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-in zoom-in-95 slide-in-from-bottom-4">
                        <button
                            onClick={() => setIsProModalOpen(false)}
                            className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 mb-4 shadow-lg shadow-orange-500/20">
                                <Settings className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Actualizar a PRO</h2>
                            <p className="text-[var(--color-text-muted)]">Desbloquea todo el potencial de tu negocio</p>
                        </div>

                        <div className="space-y-3 mb-8">
                            {[
                                "Calculador de precios inteligente",
                                "Control de nómina y asistencia",
                                "Gestión de procesos de fabricación",
                                "Sistema de Citas y Reservas",
                                "Promociones y Descuentos avanzados"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    <span className="text-[var(--color-text)] font-medium text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl p-4 text-center">
                            <p className="text-sm text-[var(--color-text-muted)] mb-1">Para activar estas funciones:</p>
                            <p className="text-lg font-semibold text-[var(--color-primary)]">Contacta con tu proveedor</p>
                        </div>

                        <button
                            onClick={() => setIsProModalOpen(false)}
                            className="w-full mt-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 rounded-xl font-medium transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
