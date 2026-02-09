'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export async function createSale(data: {
    items: { productId: string; quantity: number; price: number }[]
    total: number
    paymentMethod: string
    type: 'SALE' | 'QUOTE'
    clientId?: string
}) {
    const session = await getSession()
    const userId = session?.user?.id

    // Create Sale
    const sale = await prisma.sale.create({
        data: {
            type: data.type,
            total: data.total,
            paymentMethod: data.paymentMethod,
            userId,
            clientId: data.clientId,
            items: {
                create: data.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        }
    })

    // If it's a SALE (not QUOTE), decrement stock
    if (data.type === 'SALE') {
        for (const item of data.items) {
            // Check if product is SERVICE (no stock) or PRODUCT
            const product = await prisma.product.findUnique({ where: { id: item.productId } })
            if (product && product.type === 'PRODUCT') {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                })
            }
        }
    }

    revalidatePath('/sales')
    revalidatePath('/products') // Update stock in lists

    return { success: true, saleId: sale.id, saleCode: sale.id }
}

export async function cancelSale(saleId: number) {
    const sale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: { items: true }
    })

    if (!sale || sale.status === 'CANCELLED') return

    // Restore stock
    if (sale.type === 'SALE') {
        for (const item of sale.items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } })
            if (product && product.type === 'PRODUCT') {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                })
            }
        }
    }

    await prisma.sale.update({
        where: { id: saleId },
        data: { status: 'CANCELLED' }
    })

    revalidatePath('/reports')
    revalidatePath('/sales')
    revalidatePath('/products')
}

export async function getSales() {
    return await prisma.sale.findMany({
        include: {
            user: { select: { name: true } },
            client: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getSalesAnalytics(month?: number, year?: number, userId?: string) {

    const now = new Date()
    const targetYear = year || now.getFullYear()
    const targetMonth = month ? month - 1 : now.getMonth() // 0-indexed in JS

    const startDate = new Date(targetYear, targetMonth, 1)
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

    // Build where clause
    const whereClause: any = {
        createdAt: {
            gte: startDate,
            lte: endDate
        },
        type: 'SALE'
    }

    if (userId && userId !== 'all') {
        whereClause.userId = userId
    }

    // Fetch ALL sales for the period to show in list
    const allSales = await prisma.sale.findMany({
        where: whereClause,
        include: {
            // Include product details for the list
            items: {
                include: {
                    product: true
                }
            },
            user: true
        },
        orderBy: { createdAt: 'desc' }
    })

    // Filter for analytics calculation
    const completedSales = allSales.filter(s => s.status === 'COMPLETED')

    const totalSales = completedSales.reduce((acc, sale) => acc + sale.total, 0)
    const count = completedSales.length

    // Group by method
    const byMethod = completedSales.reduce((acc: any, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total
        return acc
    }, {})

    // Group by day for chart
    const byDay = completedSales.reduce((acc: any, sale) => {
        const day = sale.createdAt.getDate()
        acc[day] = (acc[day] || 0) + sale.total
        return acc
    }, {})

    return { totalSales, count, byMethod, byDay, sales: allSales }
}
