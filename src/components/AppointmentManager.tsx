'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO, setHours, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, MapPin, User, Clock, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { createAppointment, updateAppointmentStatus, deleteAppointment } from '@/actions/appointment'
import ClientSearch from './ClientSearch'

export default function AppointmentManager({ initialAppointments, users, initialClientId }: { initialAppointments: any[], users?: any[], initialClientId?: string }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [appointments, setAppointments] = useState(initialAppointments)
    const [showModal, setShowModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    // Form State
    const [title, setTitle] = useState('Consulta')
    const [clientId, setClientId] = useState(initialClientId || '')
    const [notes, setNotes] = useState('')
    const [time, setTime] = useState('10:00')

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Fill previous days
    const startDay = monthStart.getDay()
    const placeholders = Array.from({ length: startDay }).map((_, i) => i)

    const handleCreate = async () => {
        if (!selectedDate || !clientId) return alert('Selecciona cliente y fecha')

        const [hours, mins] = time.split(':').map(Number)
        const dateWithTime = setMinutes(setHours(selectedDate, hours), mins)

        const res = await createAppointment({
            title,
            clientId,
            date: dateWithTime,
            notes
        })

        if (res.success) {
            setShowModal(false)
            window.location.reload()
        } else {
            alert('Error al crear')
        }
    }

    const handleStatus = async (id: string, status: string) => {
        if (confirm('¿Cambiar estado?')) {
            await updateAppointmentStatus(id, status)
            window.location.reload()
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar cita?')) {
            await deleteAppointment(id)
            window.location.reload()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft />
                    </button>
                    <h2 className="text-2xl font-bold font-mono uppercase">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight />
                    </button>
                </div>
                <button
                    onClick={() => { setSelectedDate(new Date()); setShowModal(true) }}
                    className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90"
                >
                    <Plus className="h-5 w-5" /> Nueva Cita
                </button>
            </div>

            {/* Calendar Grid - Mobile Friendly Flex Wrapper */}
            <div className="bg-white/10 border border-white/10 rounded-lg overflow-hidden flex flex-wrap">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div key={d} className="bg-[var(--color-secondary)] p-3 text-center text-sm font-medium text-[var(--color-text-muted)] w-[14.28%] border-b border-white/5">
                        {d}
                    </div>
                ))}

                {placeholders.map(p => <div key={`p-${p}`} className="bg-[var(--color-secondary)]/50 min-h-[120px] w-[14.28%] border-b border-r border-white/5" />)}

                {days.map(day => {
                    const dayAppointments = appointments.filter(a => isSameDay(new Date(a.date), day))
                    const isTodayStyle = isToday(day) ? 'ring-1 ring-[var(--color-primary)] inset z-10' : ''

                    return (
                        <div
                            key={day.toString()}
                            className={`bg-[var(--color-secondary)] min-h-[120px] w-[14.28%] border-b border-r border-white/5 p-2 hover:bg-white/5 transition-colors cursor-pointer group relative ${isTodayStyle}`}
                            onClick={() => { setSelectedDate(day); setShowModal(true); }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-medium ${isToday(day) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                                    {format(day, 'd')}
                                </span>
                                {dayAppointments.length > 0 && (
                                    <span className="text-xs bg-white/10 px-1.5 rounded text-[var(--color-text-muted)]">
                                        {dayAppointments.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayAppointments.map(apt => (
                                    <div
                                        key={apt.id}
                                        className={`text-xs p-1.5 rounded border border-l-2 truncate transition-colors ${apt.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 border-l-emerald-500' :
                                            apt.status === 'CANCELLED' ? 'bg-red-500/10 border-red-500/20 border-l-red-500 opacity-60' :
                                                'bg-blue-500/10 border-blue-500/20 border-l-blue-500'
                                            }`}
                                        title={`${format(new Date(apt.date), 'HH:mm')} - ${apt.client.name}`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (confirm(`Cita: ${apt.title}\nCliente: ${apt.client.name}\nHora: ${format(new Date(apt.date), 'HH:mm')}\n\n¿Opciones?`)) {
                                                // Quick actions can go here
                                            }
                                        }}
                                    >
                                        <span className="font-mono opacity-70 mr-1">{format(new Date(apt.date), 'HH:mm')}</span>
                                        {apt.client.name}
                                    </div>
                                ))}
                            </div>

                            <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-[var(--color-primary)] rounded text-white shadow-lg transition-opacity">
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* List View of Selected Month */}
            <div className="bg-[var(--color-secondary)] rounded-xl border border-white/5 p-6 space-y-4">
                <h3 className="font-bold text-lg">Próximas Citas</h3>
                <div className="space-y-2">
                    {appointments.filter(a => a.status === 'SCHEDULED').slice(0, 5).map(apt => (
                        <div key={apt.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="text-center bg-black/20 p-2 rounded min-w-[60px]">
                                    <div className="text-xs text-[var(--color-text-muted)] uppercase">{format(new Date(apt.date), 'MMM', { locale: es })}</div>
                                    <div className="text-lg font-bold">{format(new Date(apt.date), 'd')}</div>
                                </div>
                                <div>
                                    <div className="font-medium">{apt.client.name}</div>
                                    <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> {format(new Date(apt.date), 'p', { locale: es })} — {apt.title}
                                    </div>
                                    <div className="text-xs text-[var(--color-text-muted)] mt-1">Reg: {apt.user?.name || 'Desconocido'}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(apt.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><Trash2 className="h-4 w-4" /></button>
                                <button onClick={() => handleStatus(apt.id, 'COMPLETED')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded"><CheckCircle className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ))}
                    {appointments.filter(a => a.status === 'SCHEDULED').length === 0 && <div className="text-[var(--color-text-muted)] text-sm">No hay citas pendientes.</div>}
                </div>
            </div>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--color-secondary)] border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Nueva Cita</h3>
                            <button onClick={() => setShowModal(false)}><XCircle className="h-6 w-6 text-[var(--color-text-muted)]" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha</label>
                                <div className="p-2 bg-white/5 rounded border border-white/10 text-center font-medium">
                                    {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Hora</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 bg-black/20 rounded border border-white/10" />
                            </div>

                            <ClientSearch onSelect={(c) => setClientId(c.id)} />

                            <div>
                                <label className="block text-sm font-medium mb-1">Motivo / Título</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-black/20 rounded border border-white/10" placeholder="Ej. Corte, Consulta..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Notas (Opcional)</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 bg-black/20 rounded border border-white/10 min-h-[80px]" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 hover:bg-white/5 rounded">Cancelar</button>
                            <button onClick={handleCreate} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded font-medium">Agendar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
