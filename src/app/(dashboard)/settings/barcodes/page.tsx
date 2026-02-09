import { getProducts } from '@/actions/product'
import BarcodeManager from '@/components/BarcodeManager'

export default async function BarcodePage() {
    const products = await getProducts()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white print:hidden">Códigos de Barras y QR</h1>
            <p className="text-[var(--color-text-muted)] print:hidden">
                Selecciona los productos para generar e imprimir sus etiquetas.
            </p>

            <BarcodeManager products={products} />
        </div>
    )
}
