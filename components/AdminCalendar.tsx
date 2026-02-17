'use client'

import { useState } from 'react'
import {
    format,
    startOfWeek,
    addDays,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Maximize2, Minimize2, Scissors } from 'lucide-react'
import CancelButton from './CancelButton'
import PrivacyGuard from './admin/PrivacyGuard'

export default function AdminCalendar({ initialAppointments, staff }: { initialAppointments: any[], staff: any[] }) {
    const [selectedStaffId, setSelectedStaffId] = useState<string>('all')

    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [view, setView] = useState<'day' | 'month'>('day')

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({
        start: startDate,
        end: addDays(startDate, 6)
    })

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const getAppointmentsForDate = (date: Date) => {
        return initialAppointments.filter(apt => {
            const dateMatch = isSameDay(new Date(apt.start_time), date);
            const staffMatch = selectedStaffId === 'all' || Number(apt.staff_id) === Number(selectedStaffId);
            return dateMatch && staffMatch;
        })
    }

    const selectedAppointments = getAppointmentsForDate(selectedDate)

    return (
        <div className="space-y-6">
            {/* Calendar Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setView(view === 'day' ? 'month' : 'day')}
                            className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors uppercase tracking-wider text-[10px] font-bold border border-gray-100 px-3 py-1.5 rounded-lg bg-gray-50 flex-shrink-0"
                        >
                            {view === 'day' ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                            <span>Ver {view === 'day' ? 'Mes' : 'Semana'}</span>
                        </button>

                        <div className="relative">
                            <select
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                                className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black/5 transition-all cursor-pointer appearance-none uppercase tracking-wider"
                            >
                                <option value="all">TODOS</option>
                                {staff.filter(s => s.name !== 'Cualquiera').map(s => (
                                    <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                ))}
                            </select>
                            <User className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 border-l-2 border-gray-100 pl-6 capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setCurrentDate(view === 'day' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            setCurrentDate(new Date())
                            setSelectedDate(new Date())
                        }}
                        className="px-4 text-[10px] font-bold uppercase tracking-widest hover:text-black transition-colors text-gray-500"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => setCurrentDate(view === 'day' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Weekly Strip */}
            {view === 'day' && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {weekDays.map((day, i) => {
                        const isSelected = isSameDay(day, selectedDate)
                        const hasAppointments = getAppointmentsForDate(day).length > 0
                        const isToday = isSameDay(day, new Date())

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(day)}
                                className={`flex flex-col items-center p-3 rounded-xl transition-all min-w-[64px] border ${isSelected
                                    ? 'bg-black border-black text-white shadow-md'
                                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
                                    } ${isToday && !isSelected ? 'ring-2 ring-black/5' : ''}`}
                            >
                                <span className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                                    {format(day, 'EEE', { locale: es })}
                                </span>
                                <span className="text-sm font-bold">{format(day, 'd')}</span>
                                {hasAppointments && !isSelected && (
                                    <div className="w-1 h-1 bg-black rounded-full mt-1.5" />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Monthly Grid */}
            {view === 'month' && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-7 mb-4">
                        {['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: (startOfMonth(currentDate).getDay() + 6) % 7 }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {daysInMonth.map((day, i) => {
                            const isSelected = isSameDay(day, selectedDate)
                            const appointments = getAppointmentsForDate(day)
                            const isToday = isSameDay(day, new Date())

                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setSelectedDate(day)
                                        setView('day')
                                    }}
                                    className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-all relative ${isSelected
                                        ? 'bg-black border-black text-white'
                                        : 'bg-white border-transparent hover:border-gray-100 hover:bg-gray-50 text-gray-700'
                                        } ${isToday && !isSelected ? 'ring-1 ring-inset ring-gray-900' : ''}`}
                                >
                                    <span className="text-[11px] font-bold">{format(day, 'd')}</span>
                                    {appointments.length > 0 && (
                                        <div className="mt-1 flex gap-0.5 justify-center flex-wrap px-1">
                                            {appointments.slice(0, 3).map((_, idx) => (
                                                <div key={idx} className={`w-0.5 h-0.5 rounded-full ${isSelected ? 'bg-white' : 'bg-black'}`} />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Daily Appointments List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                {format(selectedDate, "d 'de' MMMM", { locale: es })}
                            </h3>
                            <p className="text-[10px] font-medium text-gray-500">
                                {selectedAppointments.length} reserva{selectedAppointments.length !== 1 ? 's' : ''} encontrada{selectedAppointments.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-2">
                    {selectedAppointments.length === 0 ? (
                        <div className="py-16 text-center">
                            <Clock className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Sin reservas para este día</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {selectedAppointments
                                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                                .map((apt) => (
                                    <div key={apt.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50/50 transition-all gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="flex flex-col items-center justify-center py-2 px-3 bg-white border border-gray-200 rounded-lg min-w-[70px] shadow-sm">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Inicio</span>
                                                <span className="text-sm font-bold text-gray-900">{format(new Date(apt.start_time), 'HH:mm')}</span>
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">
                                                    {apt.customer_name || apt.user_name || 'Desconocido'}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Scissors className="w-3 h-3 text-gray-400" />
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        {(() => {
                                                            try {
                                                                const svcs = JSON.parse(apt.services);
                                                                return Array.isArray(svcs) ? svcs.join(' + ') : svcs;
                                                            } catch {
                                                                return apt.services;
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 self-end sm:self-auto">
                                            <div className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${apt.status === 'confirmed'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                            </div>
                                            <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block" />
                                            <CancelButton appointmentId={apt.id} />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
