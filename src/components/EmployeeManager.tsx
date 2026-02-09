'use client'

import { useState } from 'react'
import { createUser, deleteUser } from '@/actions/user'
import { Plus, Trash2, Shield, ShieldAlert, User, Check } from 'lucide-react'

export default function EmployeeManager({ users }: { users: any[] }) {
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)

    // Permission State
    const [editingUser, setEditingUser] = useState<any>(null)

    // Permission State
    const [permissions, setPermissions] = useState({
        sales: true,
        products: false,
        clients: false,
        expenses: false,
        reports: false,
        settings: false
    })

    const handlePermissionChange = (key: keyof typeof permissions) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
    }

    // Reset form state
    const resetForm = () => {
        setIsAdding(false)
        setEditingUser(null)
        setPermissions({ sales: true, products: false, clients: false, expenses: false, reports: false, settings: false })
    }

    const startEditing = (user: any) => {
        setEditingUser(user)
        setIsAdding(true)

        let userPerms: string[] = []
        try {
            userPerms = user.permissions ? JSON.parse(user.permissions) : []
        } catch (e) { }

        const newPerms = {
            sales: userPerms.includes('sales'),
            products: userPerms.includes('products'),
            clients: userPerms.includes('clients'),
            expenses: userPerms.includes('expenses'),
            reports: userPerms.includes('reports'),
            settings: userPerms.includes('settings')
        }
        setPermissions(newPerms)
    }

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        // Add permissions as JSON string
        const activePermissions = Object.entries(permissions)
            .filter(([_, enabled]) => enabled)
            .map(([key]) => key)

        formData.append('permissions', JSON.stringify(activePermissions))

        let result
        if (editingUser) {
            formData.append('id', editingUser.id)
            // If password is empty, remove it from formData inside server action logic (it handles it)
            // but we need to pass it.
            import('@/actions/user').then(async ({ updateUser }) => {
                result = await updateUser(formData)
                handleResult(result)
            })
        } else {
            const { createUser } = await import('@/actions/user')
            result = await createUser(formData)
            handleResult(result)
        }
    }

    const handleResult = (result: any) => {
        if (result?.error) {
            alert(result.error)
        } else {
            resetForm()
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">Empleados</h1>
                    <p className="text-[var(--color-text-muted)]">Gestionar acceso y permisos</p>
                </div>
                <button
                    onClick={() => {
                        resetForm()
                        setIsAdding(!isAdding)
                    }}
                    className="bg-[var(--color-primary)] hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-fit"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Empleado
                </button>
            </div>

            {isAdding && (
                <form action={handleSubmit} className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">
                        {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Nombre</label>
                            <input
                                name="name"
                                defaultValue={editingUser?.name}
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-[var(--color-text)]"
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={editingUser?.email}
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-[var(--color-text)]"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                Contraseña {editingUser && '(Dejar en blanco para mantener actual)'}
                            </label>
                            <input
                                name="password"
                                type="password"
                                required={!editingUser}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-[var(--color-text)]"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Rol</label>
                            <select
                                name="role"
                                defaultValue={editingUser?.role || 'USER'}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-[var(--color-text)]"
                            >
                                <option value="USER">Empleado (Limitado)</option>
                                <option value="ADMIN">Administrador (Total)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-3">Permisos de Acceso</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { id: 'sales', label: 'Ventas (POS)' },
                                { id: 'products', label: 'Inventario' },
                                { id: 'clients', label: 'Clientes' },
                                { id: 'expenses', label: 'Gastos' },
                                { id: 'reports', label: 'Reportes' },
                                { id: 'settings', label: 'Configuración' },
                            ].map((perm) => (
                                <button
                                    key={perm.id}
                                    type="button"
                                    onClick={() => handlePermissionChange(perm.id as any)}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${permissions[perm.id as keyof typeof permissions]
                                        ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                                        : 'bg-black/20 border-white/5 text-[var(--color-text-muted)] hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-sm">{perm.label}</span>
                                    {permissions[perm.id as keyof typeof permissions] && <Check className="h-4 w-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        <button type="button" onClick={resetForm} className="px-4 py-2 text-[var(--color-text-muted)] hover:text-white">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90">
                            {loading ? 'Guardando...' : (editingUser ? 'Actualizar Usuario' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
                    <thead className="bg-black/20 text-[var(--color-text)] uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Rol</th>
                            <th className="px-6 py-3">Permisos</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => {
                            let userPerms: string[] = []
                            try {
                                userPerms = user.permissions ? JSON.parse(user.permissions) : []
                            } catch (e) { }

                            return (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[var(--color-text)] flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            <User className="h-4 w-4" />
                                        </div>
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-black/30 text-[var(--color-text-muted)]'
                                            }`}>
                                            {user.role === 'ADMIN' ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.role === 'ADMIN' ? (
                                                <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">Acceso Total</span>
                                            ) : userPerms.length > 0 ? (
                                                userPerms.map(p => (
                                                    <span key={p} className="text-xs bg-white/5 text-[var(--color-text-muted)] px-2 py-0.5 rounded uppercase">{p}</span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-[var(--color-text-muted)] italic">Sin permisos</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => startEditing(user)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm('¿Eliminar usuario?')) await deleteUser(user.id)
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
