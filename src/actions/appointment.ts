'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function createAppointment(data: {
    title: string,
    clientId: string,
    date: Date,
    notes?: string
}) {
    const session = await getSession()
    const userId = session?.user?.id

    try {
        await prisma.appointment.create({
            data: {
                title: data.title,
                date: data.date,
                notes: data.notes,
                clientId: data.clientId,
                userId: userId,
                status: 'SCHEDULED'
            }
        })
        revalidatePath('/appointments')
        return { success: true }
    } catch (error) {
        console.error('Create Appointment Error:', error)
        return { success: false, error: 'Failed' }
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        await prisma.appointment.update({
            where: { id },
            data: { status }
        })
        revalidatePath('/appointments')
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export async function deleteAppointment(id: string) {
    try {
        await prisma.appointment.delete({ where: { id } })
        revalidatePath('/appointments')
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export async function getAppointments(month: Date) {
    const start = startOfMonth(month)
    const end = endOfMonth(month)

    return await prisma.appointment.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        },
        include: {
            client: true,
            // user: {
            //     select: { name: true }
            // }
        },
        orderBy: { date: 'asc' }
    })
}

export async function getClientAppointments(clientId: string) {
    return await prisma.appointment.findMany({
        where: { clientId },
        include: {
            client: true
        },
        orderBy: { date: 'desc' }
    })
}
