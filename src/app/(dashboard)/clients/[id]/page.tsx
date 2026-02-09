import { notFound } from 'next/navigation'
import { getClient } from '@/actions/client'
import { getClientAppointments } from '@/actions/appointment'
import ClientForm from '@/components/ClientForm'
import AppointmentManager from '@/components/AppointmentManager'

export default async function EditClientPage({ params }: { params: { id: string } }) {
    const [client, appointments] = await Promise.all([
        getClient(params.id),
        getClientAppointments(params.id)
    ])

    if (!client) {
        notFound()
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <ClientForm client={client} />
            </div>
            <div>
                <div className="bg-slate-900 border border-white/5 rounded-xl p-6 sticky top-6">
                    <AppointmentManager initialClientId={client.id} initialAppointments={appointments} />
                </div>
            </div>
        </div>
    )
}
