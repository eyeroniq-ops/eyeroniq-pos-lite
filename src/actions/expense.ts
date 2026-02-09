'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function getExpenses(month?: number, year?: number) {
    const now = new Date()
    const targetYear = year || now.getFullYear()
    const targetMonth = month ? month - 1 : now.getMonth()

    const startDate = new Date(targetYear, targetMonth, 1)
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

    return await prisma.expense.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: { date: 'desc' },
        include: { user: { select: { name: true } } }
    })
}

export async function createExpense(formData: FormData) {
    const session = await getSession()
    const userId = session?.user?.id

    const description = formData.get('description') as string
    const amount = parseFloat(formData.get('amount') as string)
    const category = formData.get('category') as string

    await prisma.expense.create({
        data: {
            description,
            amount,
            category,
            userId
        }
    })

    revalidatePath('/expenses')
}

export async function deleteExpense(id: string) {
    await prisma.expense.delete({
        where: { id }
    })
    revalidatePath('/expenses')
}
