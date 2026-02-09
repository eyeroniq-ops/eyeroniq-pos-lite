import DashboardLayout from '@/components/DashboardLayout'
import { getSession } from '@/lib/auth'

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await getSession()

    // Check Initialization
    const { isSystemInitialized } = await import('@/actions/setup')
    const initialized = await isSystemInitialized()
    if (!initialized) {
        const { redirect } = await import('next/navigation')
        redirect('/setup')
    }

    return <DashboardLayout user={session?.user}>{children}</DashboardLayout>
}
