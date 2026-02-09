'use server'

import prisma from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval } from 'date-fns'

export async function getDashboardStats() {
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    // 1. Total Sales this month
    const sales = await prisma.sale.findMany({
        where: {
            type: 'SALE',
            createdAt: { gte: start, lte: end }
        }
    })
    const totalSales = sales.reduce((sum: number, sale: any) => sum + sale.total, 0)

    // 2. Expenses this month
    const expensesList = await prisma.expense.findMany({
        where: {
            date: { gte: start, lte: end }
        }
    })
    const totalExpenses = expensesList.reduce((sum: number, exp: any) => sum + exp.amount, 0)

    // 3. New Clients
    const newClients = await prisma.client.count({
        where: {
            createdAt: { gte: start, lte: end }
        }
    })

    // 4. Chart Data (Sales per day this month)
    const days = eachDayOfInterval({ start, end })
    const chartData = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd')
        const daySales = sales.filter((s: any) => format(s.createdAt, 'yyyy-MM-dd') === dayStr)
        const total = daySales.reduce((sum: number, s: any) => sum + s.total, 0)
        return {
            date: format(day, 'd MMM'),
            sales: total
        }
    })

    return {
        totalSales,
        totalExpenses,
        netIncome: totalSales - totalExpenses,
        newClients,
        chartData
    }
}
