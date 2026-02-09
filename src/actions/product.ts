'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getProducts(query?: string) {
    return await prisma.product.findMany({
        where: {
            OR: query ? [
                { name: { contains: query } }, // removed mode: insensitive for sqlite? No, Prisma handles it usually? 
                // SQLite contains is case-sensitive by default usually, Prisma might normalize. 
                // Keeping it simple.
            ] : undefined
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getProduct(id: string) {
    return await prisma.product.findUnique({
        where: { id }
    })
}

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string
    const description = (formData.get('description') as string) || null
    const type = (formData.get('type') as string) || 'PRODUCT'
    const priceStr = formData.get('price') as string
    const costStr = formData.get('cost') as string
    const stockStr = formData.get('stock') as string

    const price = parseFloat(priceStr) || 0
    const cost = parseFloat(costStr) || 0
    const stock = parseInt(stockStr) || 0

    let barcode = formData.get('barcode') as string

    if (!barcode) {
        barcode = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }

    try {
        await prisma.product.create({
            data: {
                name,
                description,
                type,
                price,
                cost,
                stock,
                barcode
            }
        })
    } catch (error) {
        console.error('Failed to create product:', error)
        throw new Error('Error al crear el producto. Verifique los datos.')
    }

    revalidatePath('/products')
    redirect('/products')
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const description = (formData.get('description') as string) || null
    const type = (formData.get('type') as string) || 'PRODUCT'
    const priceStr = formData.get('price') as string
    const costStr = formData.get('cost') as string
    const stockStr = formData.get('stock') as string

    const price = parseFloat(priceStr) || 0
    const cost = parseFloat(costStr) || 0
    const stock = parseInt(stockStr) || 0

    const barcode = formData.get('barcode') as string

    try {
        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                type,
                price,
                cost,
                stock,
                ...(barcode && { barcode })
            }
        })
    } catch (error) {
        console.error('Failed to update product:', error)
        throw new Error('Error al actualizar el producto.')
    }

    revalidatePath('/products')
    redirect('/products')
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({
        where: { id }
    })
    revalidatePath('/products')
}

export async function generateProductBarcode(id: string) {
    // Generate a simple numeric 12-digit code or similar unique string
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const barcode = `${timestamp}${random}`

    await prisma.product.update({
        where: { id },
        data: { barcode }
    })

    revalidatePath('/products')
    revalidatePath('/settings/barcodes')
}

export async function generateBatchBarcodes(ids: string[], force: boolean = false) {
    // Determine which products to update
    const productsToUpdate = force
        ? ids
        : (await prisma.product.findMany({
            where: {
                id: { in: ids },
                barcode: null
            },
            select: { id: true }
        })).map(p => p.id)

    // Update individually to ensure unique random codes (could be optimized with raw SQL but this is safe)
    for (const id of productsToUpdate) {
        const timestamp = Date.now().toString().slice(-8)
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        const barcode = `${timestamp}${random}`

        await prisma.product.update({
            where: { id },
            data: { barcode }
        })

        // Small delay to ensure timestamp variance if processing fast
        await new Promise(resolve => setTimeout(resolve, 1))
    }

    revalidatePath('/products')
    revalidatePath('/settings/barcodes')
    return { count: productsToUpdate.length }
}
