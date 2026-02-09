'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
    try {
        let settings = await prisma.settings.findUnique({
            where: { id: 'default' }
        })

        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    id: 'default',
                    storeName: 'eyeroniq PoS Lite',
                }
            })
        } else if (settings.storeName === 'eyeroniq PoS') {
            settings = await prisma.settings.update({
                where: { id: 'default' },
                data: { storeName: 'eyeroniq PoS Lite' }
            })
        }

        return settings
    } catch (error) {
        console.error('Error fetching settings:', error)
        throw new Error('Failed to fetch settings')
    }
}

export async function updateSettings(data: {
    storeName?: string
    storeAddress?: string
    storePhone?: string
    storeLogoUrl?: string
    receiptFooter?: string
    printerType?: string
    printerWidth?: number
}) {
    try {
        const settings = await prisma.settings.upsert({
            where: { id: 'default' },
            update: data,
            create: {
                id: 'default',
                ...data
            }
        })

        revalidatePath('/settings')
        return { success: true, settings }
    } catch (error) {
        console.error('Error updating settings:', error)
        return { success: false, error: 'Failed to update settings' }
    }
}
