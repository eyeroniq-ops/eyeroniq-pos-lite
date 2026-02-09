'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initializeSystem, isSystemInitialized } from '@/actions/setup'
import { Rocket, Store, User, Upload, Check } from 'lucide-react'

export default function SetupPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form Data
    const [formData, setFormData] = useState({
        storeName: '',
        storeAddress: '',
        storePhone: '',
        logoUrl: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        // Check if already initialized
        isSystemInitialized().then(init => {
            if (init) {
                router.push('/')
            } else {
                setLoading(false)
            }
        })
    }, [router])

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.adminPassword !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

        setSubmitting(true)
        try {
            const result = await initializeSystem({
                storeName: formData.storeName,
                storeAddress: formData.storeAddress,
                storePhone: formData.storePhone,
                adminName: formData.adminName,
                adminEmail: formData.adminEmail,
                adminPassword: formData.adminPassword,
                logoUrl: formData.logoUrl
            })

            if (result.success) {
                router.push('/')
                router.refresh()
            } else {
                alert('Error: ' + result.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error al inicializar el sistema')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return null

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[var(--color-secondary)] border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[var(--color-primary)] p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Rocket className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Bienvenido</h1>
                    <p className="text-white/80 text-sm">Configuremos tu Punto de Venta</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Step 1: Branding */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-2 text-[var(--color-primary)] mb-6">
                                <Store className="h-5 w-5" />
                                <h2 className="font-semibold">Datos del Negocio</h2>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Nombre del Negocio</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.storeName}
                                    onChange={e => handleChange('storeName', e.target.value)}
                                    className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                    placeholder="Ej. Mi Tienda"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Dirección</label>
                                <input
                                    type="text"
                                    value={formData.storeAddress}
                                    onChange={e => handleChange('storeAddress', e.target.value)}
                                    className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                    placeholder="Calle Principal #123"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={formData.storePhone}
                                    onChange={e => handleChange('storePhone', e.target.value)}
                                    className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                    placeholder="55-1234-5678"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!formData.storeName}
                                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}

                    {/* Step 2: Admin */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-2 text-[var(--color-primary)] mb-6">
                                <User className="h-5 w-5" />
                                <h2 className="font-semibold">Cuenta de Administrador</h2>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Nombre del Admin</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.adminName}
                                    onChange={e => handleChange('adminName', e.target.value)}
                                    className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Email / Usuario</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.adminEmail}
                                    onChange={e => handleChange('adminEmail', e.target.value)}
                                    className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                    placeholder="admin@empresa.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Contraseña</label>
                                    <input
                                        required
                                        type="password"
                                        value={formData.adminPassword}
                                        onChange={e => handleChange('adminPassword', e.target.value)}
                                        className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                        placeholder="******"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Confirmar</label>
                                    <input
                                        required
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={e => handleChange('confirmPassword', e.target.value)}
                                        className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                        placeholder="******"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 rounded-xl font-medium text-[var(--color-text)] hover:bg-black/5 transition-colors border border-white/10"
                                >
                                    Atrás
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !formData.adminName || !formData.adminEmail || !formData.adminPassword}
                                    className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Iniciando...' : <><Check className="h-5 w-5" /> Finalizar</>}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
