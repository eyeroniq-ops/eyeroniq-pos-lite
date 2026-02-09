import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { encrypt } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // Allow login by Email OR Name
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { name: email } // 'email' var contains the input value which could be name
                ]
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        let permissions = []
        try {
            permissions = user.permissions ? JSON.parse(user.permissions) : []
        } catch (e) { }

        const session = await encrypt({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions
            },
            expires
        })

        // Set cookie
        // Note: await cookies() is async in Next.js 15+, but in 14 it's sync-ish but moving to async. 
        // The previous file used await cookies(), so we stick to that pattern.
        const cookieStore = await cookies()
        cookieStore.set('session', session, {
            expires,
            httpOnly: true,
            secure: false, // process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
