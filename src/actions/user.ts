'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function getUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string || 'USER'
    const permissions = formData.get('permissions') as string // JSON string

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                // @ts-ignore
                permissions
            }
        })
    } catch (e: any) {
        console.error("Error creating user", e)
        if (e.code === 'P2002') {
            return { error: 'El correo electrónico ya está registrado.' }
        }
        return { error: `Error al crear usuario: ${e.message}` }
    }

    revalidatePath('/employees')
    return { success: true }
}

export async function updateUser(formData: FormData) {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const permissions = formData.get('permissions') as string
    const password = formData.get('password') as string

    const data: any = {
        name,
        email,
        role,
        permissions
    }

    if (password && password.trim() !== '') {
        data.password = await bcrypt.hash(password, 10)
    }

    try {
        await prisma.user.update({
            where: { id },
            data
        })
    } catch (e: any) {
        console.error("Error updating user", e)
        if (e.code === 'P2002') {
            return { error: 'El correo electrónico ya está registrado.' }
        }
        return { error: `Error al actualizar usuario: ${e.message}` }
    }

    revalidatePath('/employees')
    return { success: true }
}

export async function deleteUser(id: string) {
    // Prevent deleting the last admin or self if needed. 
    // For now, simple delete.
    await prisma.user.delete({
        where: { id }
    })
    revalidatePath('/employees')
}
