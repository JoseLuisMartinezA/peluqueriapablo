'use client'

import { useState } from 'react'
import { Calendar, Clock, User, Scissors, Filter, Mail, Phone, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Appointment {
    id: number
    customer_name: string
    customer_email: string
    start_time: string
    end_time: string
    status: string
    services: string
    notes: string
    staff_id: number
    user_name: string | null
    staff_name: string
}

interface Staff {
    id: number
    name: string
}

interface AdminBookingsProps {
    appointments: Appointment[]
    staff: Staff[]
}

export default function AdminBookings({ appointments, staff }: AdminBookingsProps) {
    const [selectedStaff, setSelectedStaff] = useState<string>('all')

    const filteredAppointments = selectedStaff === 'all'
        ? appointments
        : appointments.filter(apt => apt.staff_id === parseInt(selectedStaff))

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'Confirmada'
            case 'pending':
                return 'Pendiente'
            case 'cancelled':
                return 'Cancelada'
            default:
                return status
        }
    }

    return (
        <div className="space-y-10">
            {/* Header with Filter */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic text-gray-900 leading-none mb-2">
                        Gestión de Citas
                    </h2>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                        {filteredAppointments.length} reserva{filteredAppointments.length !== 1 ? 's' : ''} encontrada{filteredAppointments.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Staff Filter Filter */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Filtrar por Peluquero</label>
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gold-500 transition-colors" />
                        <select
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            className="pl-12 pr-10 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-black text-xs uppercase tracking-widest focus:outline-none focus:bg-white focus:border-gold-400 transition-all cursor-pointer appearance-none shadow-sm hover:shadow-md"
                        >
                            <option value="all">TODOS LOS BARBEROS</option>
                            {staff.filter(s => s.name !== 'Cualquiera').map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name.toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Clock className="w-3 h-3 text-gold-500 rotate-90" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                        No hay citas registradas {selectedStaff !== 'all' ? 'para este barbero' : ''}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredAppointments.map((apt) => {
                        const startDate = new Date(apt.start_time)
                        const endDate = new Date(apt.end_time)
                        const customerName = apt.customer_name || apt.user_name || 'Cliente'

                        return (
                            <div
                                key={apt.id}
                                className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-black/[0.03] hover:shadow-black/[0.1] hover:scale-[1.01] transition-all duration-500 group relative overflow-hidden"
                            >
                                {/* Background Accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 ${apt.status === 'confirmed' ? 'bg-green-500' : 'bg-gold-500'}`}></div>

                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex-1 space-y-6">
                                        {/* Header Row: Profile + Name + Email */}
                                        <div className="flex items-start gap-5">
                                            <div className="w-16 h-16 bg-gold-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:bg-gold-100 transition-colors duration-500">
                                                <User className="w-8 h-8 text-gold-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-3xl font-black tracking-tighter text-gray-900 group-hover:text-gold-600 transition-colors duration-500 leading-none">
                                                    {customerName}
                                                </h3>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="font-bold text-sm tracking-tight">{apt.customer_email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Row: Date, Time, Staff */}
                                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                                    <Calendar className="w-4 h-4 text-gold-500" />
                                                </div>
                                                <span className="font-black text-gray-900 text-sm uppercase tracking-tighter">
                                                    {format(startDate, "d 'de' MMMM, yyyy", { locale: es })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-gold-500" />
                                                </div>
                                                <span className="font-black text-gray-900 text-sm uppercase tracking-tighter">
                                                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                                    <Scissors className="w-4 h-4 text-gold-500" />
                                                </div>
                                                <span className="font-black text-gray-900 text-sm uppercase tracking-tighter">
                                                    {apt.staff_name || 'Sin asignar'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Services & Notes */}
                                        <div className="space-y-3 pt-2">
                                            {apt.services && (
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Servicios:</span>
                                                    <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-xl text-sm border border-gray-100">
                                                        ["{apt.services}"]
                                                    </span>
                                                </div>
                                            )}
                                            {apt.notes && (
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Notas:</span>
                                                    <span className="font-medium text-gray-600 text-sm">
                                                        {apt.notes}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex lg:flex-col items-center justify-end gap-4 lg:pl-10 lg:border-l border-gray-100">
                                        <div className={`px-6 py-2.5 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${getStatusColor(apt.status)}`}>
                                            {getStatusLabel(apt.status)}
                                        </div>
                                        <button
                                            onClick={() => {/* Add functionality to change status or delete */ }}
                                            className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-sm"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
