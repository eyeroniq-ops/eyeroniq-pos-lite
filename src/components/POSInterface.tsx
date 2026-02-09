'use client'

import { useState, useMemo, useEffect } from 'react'
import { createSale } from '@/actions/sale'
import { Search, ShoppingCart, Trash2, CreditCard, User, FileText, Banknote, RefreshCw, ScanBarcode, X, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'

interface Product {
    id: string
    name: string
    price: number
    stock: number
    type: string
    barcode?: string | null
}

interface Client {
    id: string
    name: string
}

interface CartItem extends Product {
    quantity: number
}

export default function POSInterface({ products, clients }: { products: Product[], clients: Client[] }) {
    const router = useRouter()
    const [cart, setCart] = useState<CartItem[]>([])
    const [search, setSearch] = useState('')
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState('CASH')
    const [isQuote, setIsQuote] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showScanner, setShowScanner] = useState(false)
    const [cameras, setCameras] = useState<any[]>([])
    const [currentCameraId, setCurrentCameraId] = useState<string | null>(null)
    // Ref to track if scanner is currently running to prevent double start
    const scannerRef = useState<Html5Qrcode | null>(null)

    // Sound util
    const playBeep = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error('Audio play failed', e);
        }
    }

    useEffect(() => {
        let scanner: Html5Qrcode | null = null;

        if (showScanner) {
            // Warm up audio context on user interaction safely if needed, 
            // but the oscillator creation above is usually fine if triggered by the scan event in active window.
            // However, browsers block audio if not initiated by user. 
            // Since onScanSuccess is an async callback, it might be blocked.
            // But we can try to "unlock" audio when opening the scanner.

            // Initialize scanner
            scanner = new Html5Qrcode("reader");

            // Define success callback
            const onScanSuccess = (decodedText: string) => {
                const product = products.find(p => p.barcode === decodedText)
                if (product) {
                    playBeep()
                    addToCart(product)
                    setShowScanner(false) // Close scanner immediately
                } else {
                    // console.warn(`Code not found: ${decodedText}`)
                }
            }

            // Get cameras and start
            Html5Qrcode.getCameras().then(devices => {
                if (devices && devices.length) {
                    setCameras(devices)
                    const cameraId = currentCameraId || devices[0].id

                    scanner?.start(
                        // If we have a specific ID use it, otherwise use facingMode environment
                        currentCameraId ? { deviceId: { exact: currentCameraId } } : { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                            disableFlip: false,
                        },
                        onScanSuccess,
                        (errorMessage) => {
                            // ignore frame errors
                        }
                    ).catch(err => {
                        console.error("Error starting scanner", err)
                    })
                }
            }).catch(err => {
                console.error("Error getting cameras", err)
            });
        }

        return () => {
            if (scanner) {
                if (scanner.isScanning) {
                    scanner.stop().then(() => {
                        scanner?.clear()
                    }).catch(console.error)
                } else {
                    try { scanner.clear() } catch (e) { console.error(e) }
                }
            }
        }
    }, [showScanner, currentCameraId, products])

    const switchCamera = () => {
        if (cameras.length > 1) {
            const currentIndex = cameras.findIndex(c => c.id === currentCameraId)
            // If current not found (null or invalid), start with second (index 1) if available, else 0
            // If found, go to next, wrap around
            let nextIndex = 0
            if (currentIndex !== -1) {
                nextIndex = (currentIndex + 1) % cameras.length
            } else {
                // If we were using default (no ID set) and want to switch, try to find "back" or just take the second one
                nextIndex = 1 % cameras.length
            }
            setCurrentCameraId(cameras[nextIndex].id)
        }
    }

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    }, [products, search])

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId))
    }

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const handleCheckout = async () => {
        if (cart.length === 0) return
        setLoading(true)

        const saleData = {
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            total,
            paymentMethod,
            type: (isQuote ? 'QUOTE' : 'SALE') as 'SALE' | 'QUOTE',
            clientId: selectedClient || undefined
        }

        try {
            const result = await createSale(saleData)
            if (result.success) {
                alert(`${isQuote ? 'Cotización' : 'Venta'} completada! ID: ${result.saleCode}`)

                // Trigger Print
                if (!isQuote) {
                    try {
                        const res = await fetch('/api/print/ticket', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ saleId: result.saleId })
                        })

                        // If response is PDF, trigger download
                        const contentType = res.headers.get('content-type')
                        if (contentType && contentType.includes('application/pdf')) {
                            const blob = await res.blob()
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `ticket-${result.saleId}.pdf`
                            a.click()
                            window.URL.revokeObjectURL(url)
                        }
                    } catch (e) {
                        console.error("Print request failed", e)
                    }
                }

                setCart([])
                setSelectedClient('')
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            alert('Transacción fallida')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
            {/* Product Grid */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-[var(--color-secondary)] border border-white/5 rounded-xl p-4 flex gap-4">
                    <div className="relative flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-gray-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowScanner(!showScanner)}
                            className={`p-2 rounded-lg border border-white/10 transition-all ${showScanner ? 'bg-[var(--color-primary)] text-white' : 'bg-black/20 text-[var(--color-text-muted)] hover:text-white'}`}
                        >
                            <ScanBarcode className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="w-48">
                        <select
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
                        >
                            <option value="">Cliente Ocasional</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {showScanner && (
                    <div className="bg-[var(--color-secondary)] p-4 rounded-xl border border-white/5 relative mb-4">
                        <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-black aspect-square">
                            <div id="reader" className="w-full h-full"></div>
                        </div>

                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                            {cameras.length > 1 && (
                                <button
                                    onClick={switchCamera}
                                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                    title="Cambiar cámara"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setShowScanner(false)}
                                className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
                            Apunta el código de barras a la cámara
                        </div>
                    </div>
                )}

                <div className="flex-1 bg-[var(--color-secondary)]/50 border border-white/5 rounded-xl p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                    {filteredProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="bg-[var(--color-secondary)] hover:bg-white/5 border-2 border-[#0042aa] hover:border-indigo-400 rounded-xl p-4 text-left transition-all group flex flex-col justify-between h-32 shadow-lg"
                        >
                            <div>
                                <div className="font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                                    {product.name}
                                </div>
                                <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                    {product.type === 'SERVICE' ? 'Servicio' : `${product.stock} disponibles`}
                                </div>
                            </div>
                            <div className="text-lg font-bold text-[var(--color-text)]">
                                ${product.price}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-full lg:w-96 bg-[var(--color-secondary)] border border-white/5 rounded-xl flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 rounded-t-xl">
                    <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-[var(--color-accent)]" />
                        Venta Actual
                    </h2>
                    <button
                        onClick={() => setCart([])}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Limpiar Carrito
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(item => (
                        <div key={item.id} className="bg-black/20 border border-white/5 rounded-lg p-3 flex justify-between items-center group relative">
                            <div className="flex-1 min-w-0 mr-3">
                                <div className="text-sm font-medium text-[var(--color-text)] truncate">{item.name}</div>
                                <div className="text-xs text-[var(--color-text-muted)]">${item.price} c/u</div>
                            </div>

                            <div className="flex items-center gap-3 bg-[var(--color-secondary)] rounded-lg p-1 border border-white/5">
                                <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white/5 text-[var(--color-text)] rounded-md hover:bg-white/10 active:scale-95 transition-all text-lg font-bold"
                                >
                                    -
                                </button>
                                <span className="text-sm font-bold w-6 text-center text-[var(--color-text)] select-none">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-[var(--color-primary)] text-white rounded-md hover:opacity-90 active:scale-95 transition-all text-lg font-bold shadow-sm"
                                >
                                    +
                                </button>
                            </div>

                            <div className="ml-4 text-right flex flex-col items-end gap-1">
                                <div className="text-base font-bold text-[var(--color-text)]">${(item.price * item.quantity).toFixed(0)}</div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 -mr-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                    title="Eliminar producto"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] space-y-2 opacity-50">
                            <ShoppingCart className="h-12 w-12" />
                            <p>El carrito está vacío</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-black/20 border-t border-white/5 rounded-b-xl space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[var(--color-text-muted)]">Total</span>
                        <span className="text-3xl font-bold text-[var(--color-text)]">${total.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setPaymentMethod('CASH')}
                            className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CASH'
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                : 'bg-[var(--color-secondary)] border-white/5 text-[var(--color-text-muted)] hover:bg-white/5'
                                }`}
                        >
                            <Banknote className="h-4 w-4" />
                            Efectivo
                        </button>
                        <button
                            onClick={() => setPaymentMethod('CARD')}
                            className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CARD'
                                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                                : 'bg-[var(--color-secondary)] border-white/5 text-[var(--color-text-muted)] hover:bg-white/5'
                                }`}
                        >
                            <CreditCard className="h-4 w-4" />
                            Tarjeta
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsQuote(!isQuote)}
                            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${isQuote
                                ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                                : 'bg-white/5 border-transparent text-[var(--color-text-muted)] hover:bg-white/10'
                                }`}
                        >
                            <FileText className="h-5 w-5" />
                            {isQuote ? 'Cotizar' : 'Venta'}
                        </button>
                        <button
                            onClick={handleCheckout}
                            disabled={loading || cart.length === 0}
                            className="flex-[2] bg-[var(--color-primary)] hover:opacity-90 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : (isQuote ? 'Crear Cotización' : 'Cobrar')}
                        </button>
                    </div>

                    {/* Manual Print Button - Optional Helper */}
                    <div className="flex justify-center pt-2 border-t border-white/5">
                        <button
                            onClick={() => {
                                const lastId = prompt("ID de venta a reimprimir:");
                                if (lastId) {
                                    fetch('/api/print/ticket', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ saleId: parseInt(lastId) })
                                    }).then(res => {
                                        if (res.ok) alert("Imprimiendo...");
                                        else alert("Error al imprimir");
                                    });
                                }
                            }}
                            className="text-xs text-[var(--color-text-muted)] hover:text-white flex items-center gap-1"
                        >
                            <div className="h-4 w-4" /> Reimprimir Ticket Manual
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
