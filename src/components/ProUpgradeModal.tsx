'use client'

import { X, Check } from 'lucide-react'

interface ProUpgradeModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ProUpgradeModal({ isOpen, onClose }: ProUpgradeModalProps) {
    if (!isOpen) return null

    const features = [
        "Calculador de precios",
        "Control de nómina",
        "Procesos",
        "Citas",
        "Promociones"
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--color-background)] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[var(--color-text-muted)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                            Actualizar a Pro
                        </h2>
                        <p className="text-[var(--color-text-muted)] mt-2">
                            Desbloquea todo el potencial de tu negocio
                        </p>
                    </div>

                    <div className="space-y-3 mb-8">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-secondary)]/50 border border-white/5">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                </div>
                                <span className="text-[var(--color-text)] font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[var(--color-secondary)] p-4 rounded-xl text-center">
                        <p className="text-sm text-[var(--color-text-muted)] mb-1">
                            Para activar estas funciones
                        </p>
                        <p className="text-lg font-semibold text-[var(--color-text)]">
                            Contacta con tu proveedor
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-[var(--color-secondary)]/30 border-t border-white/5 flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
