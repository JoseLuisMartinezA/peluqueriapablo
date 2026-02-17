'use client'

import { useState } from 'react'
import { X, Calendar, Clock, Trash2, Mail, Search, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface MyAppointmentsModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function MyAppointmentsModal({ isOpen, onClose }: MyAppointmentsModalProps) {
    const [email, setEmail] = useState('')
    const [appointments, setAppointments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        setError(null)
        setHasSearched(true)

        try {
            const response = await fetch(`/api/appointments/by-email?email=${encodeURIComponent(email)}`)
            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Error al buscar citas')
                setAppointments([])
            } else {
                setAppointments(data.appointments || [])
            }
        } catch (err) {
            setError('Error de conexión')
            setAppointments([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = async (appointmentId: number) => {
        if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return

        try {
            const response = await fetch(`/api/appointments/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, email })
            })

            if (response.ok) {
                setAppointments(appointments.filter(apt => apt.id !== appointmentId))
            } else {
                const data = await response.json()
                alert(data.error || 'Error al cancelar la cita')
            }
        } catch (err) {
            alert('Error de conexión')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-gold-400 to-gold-600 p-8 md:p-10">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">
                        Mis Citas
                    </h2>
                    <p className="text-gold-100 text-sm font-medium mt-2">
                        Consulta y gestiona tus reservas
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
                    {/* Email Search Form */}
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                                Tu Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium focus:outline-none focus:border-gold-400 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            {isLoading ? 'Buscando...' : 'Buscar Mis Citas'}
                        </button>
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Appointments List */}
                    {hasSearched && !isLoading && (
                        <div className="space-y-4">
                            {appointments.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                        No tienes citas reservadas
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                                        {appointments.length} {appointments.length === 1 ? 'Cita' : 'Citas'} Encontrada{appointments.length !== 1 ? 's' : ''}
                                    </h3>
                                    {appointments.map((apt) => {
                                        const date = new Date(apt.start_time)
                                        const isPending = apt.status === 'pending'

                                        return (
                                            <div
                                                key={apt.id}
                                                className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 space-y-4 hover:border-gold-200 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${isPending
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                {isPending ? 'Pendiente' : 'Confirmada'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-900">
                                                            <Calendar className="w-5 h-5 text-gold-500" />
                                                            <span className="font-black text-lg">
                                                                {format(date, "d 'de' MMMM", { locale: es })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-600 mt-1">
                                                            <Clock className="w-5 h-5 text-gold-500" />
                                                            <span className="font-bold">
                                                                {format(date, 'HH:mm')}hs
                                                            </span>
                                                        </div>
                                                        {apt.staff_name && (
                                                            <p className="text-sm text-gray-700 font-bold mt-2">
                                                                Barbero: {apt.staff_name}
                                                            </p>
                                                        )}
                                                        {apt.services && (
                                                            <p className="text-sm text-gray-500 font-medium mt-2">
                                                                Servicios: {apt.services}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleCancel(apt.id)}
                                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                                                        title="Cancelar cita"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
