import { Suspense } from 'react'
import AppointmentManager from '@/components/AppointmentManager'
import { getAppointments } from '@/actions/appointment'

export const dynamic = 'force-dynamic'

export default async function AppointmentsPage() {
    const appointments = await getAppointments(new Date())

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[var(--color-text)]">Citas y Agenda</h1>
                <p className="text-[var(--color-text-muted)]">Gestiona el calendario de atención a clientes</p>
            </div>

            <Suspense fallback={<div className="text-center p-10">Cargando calendario...</div>}>
                <AppointmentManager initialAppointments={appointments} />
            </Suspense>
        </div>
    )
}
