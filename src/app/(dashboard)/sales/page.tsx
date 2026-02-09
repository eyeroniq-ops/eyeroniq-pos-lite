import POSInterface from '@/components/POSInterface'
import { getProducts } from '@/actions/product'
import { getClients } from '@/actions/client'

export default async function SalesPage() {
    const [products, clients] = await Promise.all([
        getProducts(),
        getClients()
    ])

    // Map products to simple interface if needed, or just pass them
    // Prisma types match closely enough
    return (
        <div className="h-full">
            <POSInterface products={products as any} clients={clients} />
        </div>
    )
}
