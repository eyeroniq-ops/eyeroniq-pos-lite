import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    // Protected routes
    const isProtectedRoute = !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/setup')
    const isLoginRoute = request.nextUrl.pathname.startsWith('/login')

    // Decrypt session
    const payload = session ? await decrypt(session) : null

    if (isProtectedRoute && !payload) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (isLoginRoute && payload) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
