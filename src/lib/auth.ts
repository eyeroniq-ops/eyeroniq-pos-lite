import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key_change_me')

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d') // 1 day session
        .sign(key)
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value
    if (!session) return null
    return await decrypt(session)
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value
    if (!session) return

    // Refresh expiration on activity
    const parsed = await decrypt(session)
    if (!parsed) return

    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // Extend 1 day
    const res = NextResponse.next()

    // Note: encryption already sets expiration claim 'exp', but we can re-issue if needed
    // For simplicity, we just return next() here unless we implement sliding window strictly
    return res
}
