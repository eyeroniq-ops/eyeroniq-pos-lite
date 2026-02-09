import { notFound } from 'next/navigation'
import { getProduct } from '@/actions/product'
import ProductForm from '@/components/ProductForm'

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const product = await getProduct(params.id)

    if (!product) {
        notFound()
    }

    return <ProductForm product={product} />
}
