import Prisma from '@/lib/prisma'
import LoginForm from '@/components/LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
    // Check Initialization
    const { isSystemInitialized } = await import('@/actions/setup')
    const initialized = await isSystemInitialized()
    if (!initialized) {
        const { redirect } = await import('next/navigation')
        redirect('/setup')
    }

    const users = await Prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true
        }
    })

    return <LoginForm users={users} />
}
