'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getClients(query?: string) {
    return await prisma.client.findMany({
        where: {
            OR: query ? [
                { name: { contains: query } },
                { email: { contains: query } },
                { phone: { contains: query } },
            ] : undefined
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getClient(id: string) {
    return await prisma.client.findUnique({
        where: { id }
    })
}

export async function createClient(formData: FormData) {
    const name = formData.get('name') as string
    const email = (formData.get('email') as string) || null
    const phone = (formData.get('phone') as string) || null
    const address = (formData.get('address') as string) || null

    if (!name) {
        throw new Error('El nombre del cliente es obligatorio')
    }

    try {
        await prisma.client.create({
            data: {
                name,
                email,
                phone,
                address,
            }
        })
    } catch (error) {
        console.error('Failed to create client:', error)
        throw new Error('Error al registrar el cliente.')
    }

    revalidatePath('/clients')
    redirect('/clients')
}

export async function updateClient(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const email = (formData.get('email') as string) || null
    const phone = (formData.get('phone') as string) || null
    const address = (formData.get('address') as string) || null

    if (!name) {
        throw new Error('El nombre del cliente es obligatorio')
    }

    try {
        await prisma.client.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                address,
            }
        })
    } catch (error) {
        console.error('Failed to update client:', error)
        throw new Error('Error al actualizar el cliente.')
    }

    revalidatePath('/clients')
    redirect('/clients')
}

export async function deleteClient(id: string) {
    await prisma.client.delete({
        where: { id }
    })
    revalidatePath('/clients')
}
