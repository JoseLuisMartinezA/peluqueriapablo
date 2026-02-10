
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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Maximize2, Minimize2 } from 'lucide-react'

export default function AdminCalendar({ initialAppointments }: { initialAppointments: any[] }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [view, setView] = useState<'day' | 'month'>('day')

    // Weekly bar logic
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({
        start: startDate,
        end: addDays(startDate, 6)
    })

    // Monthly logic
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const getAppointmentsForDate = (date: Date) => {
        return initialAppointments.filter(apt => isSameDay(new Date(apt.start_time), date))
    }

    const selectedAppointments = getAppointmentsForDate(selectedDate)

    return (
        <div className="space-y-8">
            {/* View Switcher & Nav */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                <div className="flex items-center space-x-8">
                    <button
                        onClick={() => setView(view === 'day' ? 'month' : 'day')}
                        className="flex items-center space-x-3 text-gold-600 font-black hover:text-gold-700 transition-colors uppercase tracking-[0.2em] text-[10px]"
                    >
                        {view === 'day' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        <span>{view === 'day' ? 'Mes' : 'Semana'}</span>
                    </button>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 border-l-2 border-gold-400 pl-6 hidden md:block">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                </div>

                <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100 shadow-inner">
                    <button
                        onClick={() => setCurrentDate(view === 'day' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))}
                        className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                        onClick={() => {
                            setCurrentDate(new Date())
                            setSelectedDate(new Date())
                        }}
                        className="px-6 text-[10px] font-black uppercase tracking-[0.3em] hover:text-gold-600 transition-colors text-gray-900"
                    >
                        {view === 'day' ? 'Semana' : format(currentDate, 'MMMM yyyy', { locale: es })}
                    </button>
                    <button
                        onClick={() => setCurrentDate(view === 'day' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))}
                        className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Weekly Navigation Bar (Only in Day View) */}
            {view === 'day' && (
                <div className="flex md:grid md:grid-cols-7 gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    {weekDays.map((day, i) => {
                        const isSelected = isSameDay(day, selectedDate)
                        const hasAppointments = getAppointmentsForDate(day).length > 0

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(day)}
                                className={`flex flex-col items-center p-4 md:p-6 rounded-[24px] md:rounded-[28px] transition-all relative min-w-[70px] md:min-w-0 flex-shrink-0 ${isSelected
                                    ? 'gold-gradient text-white shadow-[0_10px_20px_rgba(197,160,89,0.3)] scale-105 z-10'
                                    : 'bg-white border border-gray-100 hover:border-gold-200 shadow-sm'
                                    }`}
                            >
                                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1 md:mb-2 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                    {format(day, 'EEE', { locale: es })}
                                </span>
                                <span className="text-lg md:text-2xl font-black">{format(day, 'd')}</span>
                                {hasAppointments && !isSelected && (
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gold-500 rounded-full mt-2 md:mt-3 shadow-sm" />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Monthly View */}
            {view === 'month' && (
                <div className="bg-white p-4 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100 animate-fade-in overflow-x-auto">
                    <div className="min-w-[300px]">
                        <div className="grid grid-cols-7 mb-4 md:mb-8">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 md:gap-3">
                            {/* Empty cells for start of month */}
                            {Array.from({ length: (startOfMonth(currentDate).getDay() + 6) % 7 }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square opacity-20" />
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
                                        className={`aspect-square flex flex-col items-center justify-center rounded-xl md:rounded-2xl transition-all relative group ${isSelected ? 'gold-gradient text-white shadow-lg' : 'hover:bg-gray-50 border border-transparent hover:border-gray-100'
                                            } ${isToday && !isSelected ? 'border-2 border-gold-400' : ''}`}
                                    >
                                        <span className={`text-sm md:text-lg font-black ${isSelected ? 'text-white' : 'text-gray-700'}`}>{format(day, 'd')}</span>
                                        {appointments.length > 0 && (
                                            <div className={`mt-1 md:mt-2 flex gap-0.5 md:gap-1 justify-center flex-wrap px-1`}>
                                                {appointments.slice(0, 3).map((_, idx) => (
                                                    <div key={idx} className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-gold-500'}`} />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Detail View (Today's List) */}
            <div className="animate-slide-up bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 pb-6 border-b border-gray-50 gap-4">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight flex items-center space-x-3 md:space-x-4">
                        <div className="p-2 md:p-3 bg-gold-400 rounded-xl md:rounded-2xl text-white shadow-md">
                            <CalendarIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="leading-tight">Citas: {format(selectedDate, 'd MMM', { locale: es })}</span>
                    </h3>
                    <span className="text-[9px] md:text-[10px] font-black uppercase bg-gray-100 text-gray-500 px-4 py-2 rounded-full tracking-widest w-fit">
                        {selectedAppointments.length} Cita{selectedAppointments.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {selectedAppointments.length === 0 ? (
                    <div className="py-12 md:py-20 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-8 h-8 md:w-10 md:h-10 text-gray-200" />
                        </div>
                        <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest italic">Sin citas registradas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {selectedAppointments
                            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                            .map((apt) => (
                                <div key={apt.id} className="bg-gray-50 p-6 md:p-8 rounded-[24px] md:rounded-[32px] flex flex-col sm:flex-row md:items-center justify-between gap-4 md:gap-6 border border-gray-100 hover:border-gold-300 transition-all group">
                                    <div className="flex items-center space-x-6 md:space-x-8">
                                        <div className="flex flex-col items-center justify-center p-4 md:p-5 bg-white rounded-2xl md:rounded-3xl group-hover:bg-gold-400 group-hover:text-white transition-all shadow-sm w-20 md:w-24">
                                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Hora</span>
                                            <span className="text-xl md:text-2xl font-black">{format(new Date(apt.start_time), 'HH:mm')}</span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="flex items-center space-x-2 mb-1 md:mb-2">
                                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-gold-500 rounded-full" />
                                                <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cliente</span>
                                            </div>
                                            <p className="font-black text-lg md:text-2xl text-gray-900 font-playfair truncate">{apt.user_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 pt-2 sm:pt-0">
                                        <CancelButton appointmentId={apt.id} />
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {apt.status === 'confirmed' ? 'Ok' : 'Wait'}
                                        </div>
                                        <User className="w-8 h-8 md:w-10 md:h-10 text-gray-100" />
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}

import CancelButton from './CancelButton'

