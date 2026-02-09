'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/auth'

export async function isSystemInitialized() {
    try {
        const adminCount = await prisma.user.count({
            where: { role: 'ADMIN' }
        })
        return adminCount > 0
    } catch (error) {
        console.error('Check init failed:', error)
        return false // Fail safe
    }
}

export async function initializeSystem(data: {
    storeName: string
    storeAddress?: string
    storePhone?: string
    adminName: string
    adminEmail: string
    adminPassword: string
    logoUrl?: string
}) {
    try {
        // Double check to prevent re-init
        const initialized = await isSystemInitialized()
        if (initialized) {
            return { success: false, error: 'System already initialized' }
        }

        // 1. Update Settings
        await prisma.settings.upsert({
            where: { id: 'default' },
            create: {
                id: 'default',
                storeName: data.storeName,
                storeAddress: data.storeAddress,
                storePhone: data.storePhone,
                storeLogoUrl: data.logoUrl
            },
            update: {
                storeName: data.storeName,
                storeAddress: data.storeAddress,
                storePhone: data.storePhone,
                storeLogoUrl: data.logoUrl
            }
        })

        // 2. Create Admin User
        const hashedPassword = await bcrypt.hash(data.adminPassword, 10)
        const user = await prisma.user.create({
            data: {
                name: data.adminName,
                email: data.adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
                permissions: JSON.stringify(['all'])
            }
        })

        // 3. Auto Login
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: ['all']
            },
            expires
        })

        const cookieStore = await cookies()
        cookieStore.set('session', session, {
            expires,
            httpOnly: true,
            secure: false, // process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })

        return { success: true }
    } catch (error) {
        console.error('Init failed:', error)
        return { success: false, error: 'Initialization failed' }
    }
}

export async function resetSystem() {
    try {
        // DANGER: Wipe everything except maybe nothing? 
        // We wipe everything that depends on users or is transaction data

        await prisma.$transaction([
            prisma.saleItem.deleteMany({}),
            prisma.sale.deleteMany({}),
            prisma.appointment.deleteMany({}),
            prisma.expense.deleteMany({}),
            prisma.product.deleteMany({}),
            prisma.client.deleteMany({}),
            prisma.user.deleteMany({}), // Wiping users triggers "uninitialized" state
            // Keep settings? Maybe reset them too? User asked for wizard to select brand name again.
            // So we can keep the record but maybe clear it, or just overwrite it on next setup.
            // Let's leave settings as is, they will be overwritten in the wizard.
        ])

        // Clear session cookie
        const cookieStore = await cookies()
        cookieStore.delete('session')

        return { success: true }
    } catch (error) {
        console.error('System reset failed:', error)
        return { success: false, error: 'Reset failed' }
    }
}
