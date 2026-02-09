'use client'

import { useState, useEffect } from 'react'
import { Save, RotateCcw, AlertTriangle, Upload, X, Printer, Receipt } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { getSettings, updateSettings } from '@/actions/settings'

export default function SettingsPage() {
    const { theme, updateTheme, resetTheme } = useTheme()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        storeName: '',
        storeAddress: '',
        storePhone: '',
        storeLogoUrl: '',
        receiptFooter: '',
        printerType: 'THERMAL',
        printerWidth: 80
    })

    const [uploading, setUploading] = useState(false)

    // Load Settings
    useEffect(() => {
        getSettings().then(settings => {
            if (settings) {
                setFormData({
                    storeName: settings.storeName,
                    storeAddress: settings.storeAddress || '',
                    storePhone: settings.storePhone || '',
                    storeLogoUrl: settings.storeLogoUrl || '',
                    receiptFooter: settings.receiptFooter || '',
                    printerType: settings.printerType,
                    printerWidth: settings.printerWidth
                })

                // Sync Theme Context if needed
                updateTheme({
                    ...theme,
                    businessName: settings.storeName,
                    logoUrl: settings.storeLogoUrl || undefined,
                    phone: settings.storePhone || undefined,
                    location: settings.storeAddress || undefined
                })
            }
            setLoading(false)
        })
    }, [])

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await updateSettings(formData)

            if (result.success) {
                // Update UI Theme
                updateTheme({
                    ...theme,
                    businessName: formData.storeName,
                    logoUrl: formData.storeLogoUrl || undefined,
                    phone: formData.storePhone || undefined,
                    location: formData.storeAddress || undefined
                })
                alert('Configuración guardada correctamente')
            } else {
                console.error("Save failed", result)
                alert('Error al guardar: ' + (result.error || 'Intente de nuevo'))
            }
        } catch (error) {
            console.error(error)
            alert('Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        setUploading(true)
        const data = new FormData()
        data.append('file', e.target.files[0])

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            })
            if (res.ok) {
                const json = await res.json()
                handleChange('storeLogoUrl', json.url)
            } else {
                alert('Error al subir imagen')
            }
        } catch (error) {
            console.error(error)
            alert('Error al subir imagen')
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-[var(--color-text-muted)]">Cargando configuración...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-text)]">Configuración</h1>
                <p className="text-[var(--color-text-muted)]">Personaliza la apariencia y detalles de tu negocio</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <section className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-[var(--color-text)]">Información del Negocio</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Nombre del Negocio</label>
                                <input
                                    type="text"
                                    value={formData.storeName}
                                    onChange={(e) => handleChange('storeName', e.target.value)}
                                    className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Teléfono</label>
                                <input
                                    type="text"
                                    value={formData.storePhone}
                                    onChange={(e) => handleChange('storePhone', e.target.value)}
                                    className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Dirección</label>
                                <input
                                    type="text"
                                    value={formData.storeAddress}
                                    onChange={(e) => handleChange('storeAddress', e.target.value)}
                                    className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <a href="/employees" className="flex items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors group">
                                <div>
                                    <h3 className="font-medium text-[var(--color-text)]">Gestión de Empleados</h3>
                                    <p className="text-sm text-[var(--color-text-muted)]">Administrar usuarios y permisos de acceso</p>
                                </div>
                                <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                    Gestionar
                                </div>
                            </a>
                        </div>
                    </section>

                    <section className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-[var(--color-text)]">Logo</h2>
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 bg-white rounded-lg border border-white/10 flex items-center justify-center p-2 overflow-hidden shadow-inner shrink-0">
                                {formData.storeLogoUrl ? (
                                    <img src={formData.storeLogoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-xs text-center text-gray-400">Sin Logo</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-4 min-w-0">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Subir Imagen</label>
                                    <div className="flex gap-2">
                                        <label className="cursor-pointer bg-[var(--color-primary)] hover:opacity-90 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                                            <Upload className="h-4 w-4" />
                                            <span className="text-sm font-medium">{uploading ? 'Subiendo...' : 'Seleccionar'}</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                        </label>
                                        {formData.storeLogoUrl && (
                                            <button
                                                onClick={() => handleChange('storeLogoUrl', '')}
                                                className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-lg border border-red-500/20"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-[var(--color-text)]">Herramientas</h2>
                        <a href="/settings/barcodes" className="flex items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors group">
                            <div>
                                <h3 className="font-medium text-[var(--color-text)]">Estudio de Códigos de Barras</h3>
                                <p className="text-sm text-[var(--color-text-muted)]">Generar e imprimir etiquetas para inventario</p>
                            </div>
                            <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                Abrir
                            </div>
                        </a>
                    </section>

                    {/* TICKET CONFIGURATION */}
                    <section className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-[var(--color-primary)]" />
                            <h2 className="text-xl font-semibold text-[var(--color-text)]">Configuración del Ticket</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Pie de Página (Footer)</label>
                                <textarea
                                    value={formData.receiptFooter}
                                    onChange={(e) => handleChange('receiptFooter', e.target.value)}
                                    placeholder="Gracias por su compra..."
                                    className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Ancho de Papel</label>
                                    <select
                                        value={formData.printerWidth}
                                        onChange={(e) => handleChange('printerWidth', parseInt(e.target.value))}
                                        className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                    >
                                        <option value={80}>80 mm</option>
                                        <option value={58}>58 mm</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Tipo de Impresión</label>
                                    <select
                                        value={formData.printerType}
                                        onChange={(e) => handleChange('printerType', e.target.value)}
                                        className="w-full bg-black/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                                    >
                                        <option value="THERMAL">Térmica (ESC/POS)</option>
                                        <option value="PDF_ONLY">Solo PDF</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* DANGER ZONE */}
                    <section className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 space-y-6 shadow-sm">
                        <div className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">Zona de Peligro</h2>
                        </div>

                        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                            <h3 className="font-medium text-red-400 mb-1">Restablecer Sistema</h3>
                            <p className="text-sm text-red-500/70 mb-4">
                                Esta acción eliminará permanentemente todos los datos (Ventas, Productos, Clientes, Usuarios).
                                El sistema volverá al estado de fábrica y requerirá configuración inicial.
                            </p>
                            <button
                                onClick={async () => {
                                    if (confirm('¿ESTÁS SEGURO? Esta acción borrará TODOS los datos y no se puede deshacer.')) {
                                        if (confirm('Confirmar por segunda vez: ¿Borrar todo?')) {
                                            setLoading(true)
                                            try {
                                                const { resetSystem } = await import('@/actions/setup')
                                                const res = await resetSystem()
                                                if (res.success) {
                                                    window.location.href = '/'
                                                } else {
                                                    alert('Error al restablecer: ' + res.error)
                                                }
                                            } catch (e) {
                                                console.error(e)
                                                alert('Error crítico al restablecer')
                                            } finally {
                                                setLoading(false)
                                            }
                                        }
                                    }
                                }}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Restablecer de Fábrica
                            </button>
                        </div>
                    </section>

                    {/* ACTIONS */}
                    <div className="fixed bottom-8 right-8 flex gap-3 shadow-2xl rounded-full p-2 bg-white/10 backdrop-blur-xl border border-white/20 z-50">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-3 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 bg-[var(--color-primary)]"
                            title="Guardar cambios"
                        >
                            {saving ? <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div >
        </div >
    )
}

