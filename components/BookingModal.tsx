
'use client'

import { format } from 'date-fns'
import React, { useState, useEffect, useRef } from 'react'
import {
    X, ChevronLeft, ChevronRight, User, Plus, Info,
    Calendar as CalendarIcon, Clock, Check, ArrowLeft, MessageSquare, Search, Star
} from 'lucide-react'
import { bookAppointment } from '@/app/actions'

interface Service {
    id: string
    name: string
    price: string
    duration: string
    popular?: boolean
    category: string
    description?: string
    images?: string[]
}

interface Staff {
    id: string | number
    name: string
    avatar?: string
    avatar_url?: string
}


interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    service: { id: string | number, name: string, price: string, duration: string } | null
    servicesPool: Service[]
    staffPool: Staff[]
}

const timeSlots = {
    morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
    afternoon: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
    night: ['19:00', '19:30', '20:00', '20:30']
}

export default function BookingModal({ isOpen, onClose, service, servicesPool, staffPool }: BookingModalProps) {
    const [selectedServices, setSelectedServices] = useState<Service[]>([])
    const [isSelectingExtraServices, setIsSelectingExtraServices] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedStaff, setSelectedStaff] = useState<Staff>(staffPool?.[0] || { id: 'default', name: 'Personal', avatar: '' })

    const [timeFilter, setTimeFilter] = useState<'morning' | 'afternoon' | 'night'>('morning')
    const [isMobile, setIsMobile] = useState(false)
    const [notes, setNotes] = useState('')
    const [serviceToReplaceId, setServiceToReplaceId] = useState<string | null>(null)

    // Booking state
    const [bookingMessage, setBookingMessage] = useState<string | null>(null)
    const [bookingError, setBookingError] = useState<string | null>(null)
    const [isBookingLoading, setIsBookingLoading] = useState(false)
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [isSlotsLoading, setIsSlotsLoading] = useState(false)

    const timeScrollRef = useRef<HTMLDivElement>(null)
    const dateScrollRef = useRef<HTMLDivElement>(null)

    // Sync with initial service
    useEffect(() => {
        if (service && selectedServices.length === 0) {
            const initialService = servicesPool.find(s => s.id === service.id) || { ...service, category: 'General' } as Service
            setSelectedServices([initialService])
        }
    }, [service, isOpen])

    useEffect(() => {
        const fetchSlots = async () => {
            setIsSlotsLoading(true)
            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd')
                const staffId = selectedStaff.id
                const res = await fetch(`/api/availability?date=${dateStr}&staffId=${staffId}`)
                const data = await res.json()
                if (data.slots) {
                    setAvailableSlots(data.slots)
                }
            } catch (err) {
                console.error('Error fetching slots:', err)
            } finally {
                setIsSlotsLoading(false)
            }
        }

        if (isOpen) {
            fetchSlots()
        }
    }, [selectedDate, selectedStaff, isOpen])

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)

        if (isOpen) {
            document.body.style.overflow = 'hidden'
        }

        return () => {
            window.removeEventListener('resize', checkMobile)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedTime) return

        setIsBookingLoading(true)
        setBookingError(null)

        const formData = new FormData(e.currentTarget)
        const result = await bookAppointment(formData)

        setIsBookingLoading(false)
        if (result.success) {
            setBookingMessage(result.message)
        } else {
            setBookingError(result.error)
        }
    }

    if (!isOpen) return null

    const handleAddService = (s: Service) => {
        if (serviceToReplaceId) {
            const others = selectedServices.filter(svc => svc.id !== serviceToReplaceId && svc.id !== s.id)
            setSelectedServices([...others, s])
            setServiceToReplaceId(null)
        } else {
            if (!selectedServices.find(item => item.id === s.id)) {
                setSelectedServices([...selectedServices, s])
            }
        }
        setIsSelectingExtraServices(false)
    }

    const removeService = (id: string) => {
        if (selectedServices.length > 1) {
            setSelectedServices(selectedServices.filter(s => s.id !== id))
        }
    }

    const totalPrice = selectedServices.reduce((acc, s) => acc + parseInt(s.price), 0)
    const totalDuration = selectedServices.reduce((acc, s) => acc + parseInt(s.duration), 0)

    const filteredServices = servicesPool.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const servicesByCategory = filteredServices.reduce((acc, s) => {
        if (!acc[s.category]) acc[s.category] = []
        acc[s.category].push(s)
        return acc
    }, {} as Record<string, Service[]>)

    const allTimeSlots = [
        ...timeSlots.morning.map(t => ({ time: t, type: 'morning' as const })),
        ...timeSlots.afternoon.map(t => ({ time: t, type: 'afternoon' as const })),
        ...timeSlots.night.map(t => ({ time: t, type: 'night' as const }))
    ]

    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i)
        return d
    })

    const handleDragScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
        let isDown = false
        let startX: number
        let scrollLeft: number

        const onMouseDown = (e: React.MouseEvent) => {
            if (!ref.current) return
            isDown = true
            ref.current.classList.add('cursor-grabbing')
            startX = e.pageX - ref.current.offsetLeft
            scrollLeft = ref.current.scrollLeft
        }

        const onMouseLeave = () => {
            if (!ref.current) return
            isDown = false
            ref.current.classList.remove('cursor-grabbing')
        }

        const onMouseUp = () => {
            if (!ref.current) return
            isDown = false
            ref.current.classList.remove('cursor-grabbing')
        }

        const onMouseMove = (e: React.MouseEvent) => {
            if (!isDown || !ref.current) return
            e.preventDefault()
            const x = e.pageX - ref.current.offsetLeft
            const walk = (x - startX) * 2
            ref.current.scrollLeft = scrollLeft - walk
        }

        return { onMouseDown, onMouseLeave, onMouseUp, onMouseMove }
    }

    const dateDragProps = handleDragScroll(dateScrollRef)
    const timeDragProps = handleDragScroll(timeScrollRef)

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -300 : 300
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    const scrollToFilter = (filter: 'morning' | 'afternoon' | 'night') => {
        setTimeFilter(filter)
        const firstSlot = allTimeSlots.find(s => s.type === filter)
        if (firstSlot && timeScrollRef.current) {
            const element = timeScrollRef.current.querySelector(`[data-time="${firstSlot.time}"]`)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }
        }
    }

    // Service Selection View Content
    const ServiceSelectionContent = (
        <div className={`flex flex-col h-full bg-white ${!isMobile ? 'rounded-[3rem] overflow-hidden' : ''}`}>
            {/* 1. Navigation Bar */}
            <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
                <button
                    onClick={() => setIsSelectingExtraServices(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center space-x-2"
                >
                    <ArrowLeft className="w-6 h-6" />
                    {!isMobile && <span className="text-xs font-black uppercase tracking-widest">Atrás</span>}
                </button>
                <h1 className="text-lg font-black uppercase tracking-[0.2em]">{isMobile ? 'Servicios' : 'Añadir otro servicio'}</h1>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                </button>
            </header>

            <main className="flex-grow overflow-y-auto custom-scrollbar px-6 md:px-12 py-10 min-h-0">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* 2. Header de Negocio (Only Desktop) */}
                    {!isMobile && (
                        <div className="flex items-center justify-between border-b border-gray-50 pb-10">
                            <div className="space-y-1">
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Barbershop</h2>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Calle Principal 123, Madrid</p>
                            </div>
                            <div className="text-right flex items-center space-x-4">
                                <div className="space-y-1">
                                    <div className="text-2xl font-black text-gray-900 flex items-center justify-end space-x-2">
                                        <span>4.9</span>
                                        <Star className="w-5 h-5 fill-gold-400 text-gold-400" />
                                    </div>
                                    <div className="flex text-gold-400 justify-end">
                                        {[1, 2, 3, 4].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                                    </div>
                                </div>
                                <span className="px-4 py-2 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Google reviews</span>
                            </div>
                        </div>
                    )}

                    {/* 3. Buscador */}
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gold-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar servicio..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-14 py-6 text-gray-900 focus:outline-none focus:bg-white focus:border-gold-400/50 transition-all placeholder:text-gray-300 font-bold shadow-inner"
                        />
                    </div>

                    {/* 4. Lista de Servicios */}
                    <div className="space-y-16">
                        {Object.entries(servicesByCategory).map(([category, items]) => (
                            <section key={category} className="space-y-8">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4 px-2">
                                    <div className="flex items-center space-x-3">
                                        <ChevronRight className={`w-5 h-5 text-gold-500 transition-transform ${items.length > 0 ? 'rotate-90' : ''}`} />
                                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-900">{category}</h3>
                                    </div>
                                    <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">{items.length} servicios</span>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {items.map((s) => (
                                        <div
                                            key={s.id}
                                            className="group flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-gold-300 hover:shadow-2xl hover:shadow-gold-100/50 transition-all duration-500"
                                        >
                                            <div className="flex-grow space-y-4">
                                                <div>
                                                    <h4 className="text-xl font-black tracking-tight text-gray-900 group-hover:text-gold-600 transition-colors">{s.name}</h4>
                                                    {s.description && <p className="text-gray-400 text-[11px] font-semibold mt-1 leading-relaxed max-w-md">{s.description}</p>}
                                                </div>

                                                {!isMobile && s.images && s.images.length > 0 && (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex -space-x-4">
                                                            {s.images.map((img, i) => (
                                                                <img key={i} src={img} className="w-10 h-10 rounded-full border-4 border-white object-cover shadow-sm" alt="" />
                                                            ))}
                                                        </div>
                                                        <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gold-50 hover:text-gold-600 transition-all">
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="md:text-right flex md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-8 md:mt-0 pt-8 md:pt-0 border-t md:border-t-0 border-gray-50">
                                                <div className="md:mb-4">
                                                    <div className="text-3xl font-black text-gray-900">{s.price}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.duration}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddService(s)}
                                                    className="px-10 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all shadow-xl active:scale-95"
                                                >
                                                    Reservar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )

    // Separate view for Mobile vs Desktop
    const ExtraServicesView = isMobile ? (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
            {ServiceSelectionContent}
        </div>
    ) : (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 bg-white/20 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-5xl max-h-[90vh] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 bg-white rounded-[3rem] overflow-hidden flex flex-col">
                {ServiceSelectionContent}
            </div>
        </div>
    )

    // Main Modal Layouts

    if (bookingMessage) {
        return (
            <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="max-w-md space-y-10">
                    <div className="w-32 h-32 bg-gold-400 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                        <Check className="w-16 h-16 text-white" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">{bookingMessage}</h2>
                        <p className="text-gray-400 font-medium leading-relaxed">Te hemos enviado un enlace de confirmación a tu correo. La reserva se activará en cuanto pulses el enlace.</p>
                    </div>
                    <button onClick={onClose} className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        Entendido
                    </button>
                </div>
            </div>
        )
    }

    const DesktopLayout = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-12 bg-white/20 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Header */}
                <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <h2 className="text-xl font-black uppercase tracking-widest text-gray-900">
                        {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </header>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                    <div className="p-10 space-y-12 overflow-y-auto custom-scrollbar flex-grow pb-10">
                        {/* A. Selector de Staff */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">PROFESIONAL</h3>
                            <div className="flex space-x-8 p-10 -m-10 overflow-visible">
                                {staffPool.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setSelectedStaff(s)}
                                        className="group flex flex-col items-center space-y-3 focus:outline-none"
                                    >
                                        <div className={`relative p-1 rounded-full transition-all duration-500 ${selectedStaff.id === s.id ? 'ring-4 ring-gold-400 ring-offset-4 scale-110 shadow-2xl' : 'grayscale hover:grayscale-0 opacity-60'}`}>
                                            <img src={s.avatar_url || s.avatar} alt={s.name} className="w-20 h-20 rounded-full object-cover shadow-xl" />
                                            {selectedStaff.id === s.id && (
                                                <div className="absolute -bottom-1 -right-1 bg-gold-400 text-white p-1.5 rounded-full shadow-lg">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${selectedStaff.id === s.id ? 'text-black' : 'text-gray-400'}`}>{s.name}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* B. Selector de Fechas */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">FECHA</h3>
                            <div className="flex items-center space-x-4">
                                <button type="button" onClick={() => scroll(dateScrollRef, 'left')} className="p-2 hover:bg-gray-50 rounded-full"><ChevronLeft /></button>
                                <div
                                    ref={dateScrollRef}
                                    {...dateDragProps}
                                    className="flex overflow-x-auto no-scrollbar space-x-4 py-16 -my-16 flex-grow cursor-grab active:cursor-grabbing select-none"
                                >
                                    {days.map((date, i) => {
                                        const isSelected = date.toDateString() === selectedDate.toDateString()
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setSelectedDate(date)}
                                                className={`flex-shrink-0 w-24 p-5 rounded-3xl border-2 transition-all ${isSelected
                                                    ? 'bg-black border-black text-white shadow-2xl scale-105'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gold-200'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center space-y-1">
                                                    <span className="text-[10px] font-black uppercase opacity-60">
                                                        {date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                                                    </span>
                                                    <span className="text-2xl font-black tracking-tighter">{date.getDate()}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                                <button type="button" onClick={() => scroll(dateScrollRef, 'right')} className="p-2 hover:bg-gray-50 rounded-full"><ChevronRight /></button>
                            </div>
                        </section>

                        {/* C. Selector de Horas */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">DISPONIBILIDAD</h3>
                                <div className="bg-gray-100 p-1 rounded-2xl flex space-x-1">
                                    {(['morning', 'afternoon', 'night'] as const).map(f => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => scrollToFilter(f)}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${timeFilter === f ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                                        >
                                            {f === 'morning' ? 'Mañana' : f === 'afternoon' ? 'Tarde' : 'Noche'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button type="button" onClick={() => scroll(timeScrollRef, 'left')} className="p-2 hover:bg-gray-50 rounded-full"><ChevronLeft /></button>
                                <div
                                    ref={timeScrollRef}
                                    {...timeDragProps}
                                    className="flex overflow-x-auto no-scrollbar space-x-3 py-16 -my-16 flex-grow cursor-grab active:cursor-grabbing select-none"
                                >
                                    {allTimeSlots.map(({ time, type }) => {
                                        const isAvailable = availableSlots.includes(time);
                                        const isSelected = selectedTime === time;

                                        return (
                                            <button
                                                key={time}
                                                type="button"
                                                disabled={!isAvailable}
                                                data-time={time}
                                                onClick={() => { setSelectedTime(time); setTimeFilter(type); }}
                                                className={`flex-shrink-0 w-28 py-5 rounded-2xl border-2 text-sm font-black transition-all ${isSelected
                                                    ? 'bg-gold-400 border-gold-400 text-white shadow-2xl scale-110'
                                                    : isAvailable
                                                        ? 'bg-white border-gray-100 text-gray-500 hover:border-gold-300'
                                                        : 'bg-gray-50 border-transparent text-gray-200 cursor-not-allowed opacity-50'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        )
                                    })}
                                </div>
                                <button type="button" onClick={() => scroll(timeScrollRef, 'right')} className="p-2 hover:bg-gray-50 rounded-full"><ChevronRight /></button>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* D. Resumen de Servicios */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">SERVICIOS SELECCIONADOS</h3>
                                <div className="space-y-4">
                                    {selectedServices.map((s) => (
                                        <div key={s.id} className="bg-gray-50 rounded-[2.5rem] p-8 space-y-6 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all border border-transparent hover:border-gray-100 overflow-visible relative">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-2xl italic tracking-tighter text-gray-900 leading-tight">{s.name}</h4>
                                                <div className="text-2xl font-black text-gray-900">{s.price}</div>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-gray-100/50">
                                                <div className="flex items-center space-x-3">
                                                    <img src={selectedStaff.avatar_url || selectedStaff.avatar} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" alt="" />
                                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{selectedStaff.name}</span>
                                                </div>

                                                {selectedServices.length > 1 ? (
                                                    <button type="button" onClick={() => removeService(s.id)} className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 tracking-widest transition-all font-black">Eliminar</button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setServiceToReplaceId(s.id); setIsSelectingExtraServices(true); }}
                                                        className="text-[10px] font-black uppercase text-gold-600 hover:text-gold-700 tracking-widest transition-all font-black"
                                                    >
                                                        Cambiar Servicio
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => { setServiceToReplaceId(null); setIsSelectingExtraServices(true); }}
                                        className="flex items-center space-x-3 text-[11px] font-black uppercase tracking-widest text-gold-600 py-4 group hover:opacity-80 transition-opacity"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Añadir otro servicio</span>
                                    </button>
                                </div>
                            </section>

                            {/* E. Datos del Cliente */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">TUS DATOS</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Nombre Completo</label>
                                        <input
                                            name="customer_name"
                                            required
                                            placeholder="Ej: Juan Pérez"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-black focus:ring-2 focus:ring-gold-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Correo Electrónico</label>
                                        <input
                                            name="customer_email"
                                            type="email"
                                            required
                                            placeholder="tu@email.com"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-black focus:ring-2 focus:ring-gold-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Notas (Opcional)</label>
                                        <textarea
                                            name="notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Indica si tienes alguna preferencia..."
                                            className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium min-h-[100px] focus:ring-2 focus:ring-gold-200"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Hidden Fields for metadata */}
                    <input type="hidden" name="date" value={format(selectedDate, 'yyyy-MM-dd')} />
                    <input type="hidden" name="time" value={selectedTime || ''} />
                    <input type="hidden" name="staff_id" value={selectedStaff.id || ''} />
                    <input type="hidden" name="services" value={JSON.stringify(selectedServices.map(s => s.name))} />

                    {/* Footer */}
                    <footer className="p-10 border-t border-gray-100 bg-white sticky bottom-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                        {bookingError && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                                {bookingError}
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em]">{selectedServices.length} Servicios • {totalDuration} min</p>
                                <p className="text-5xl font-black italic tracking-tighter text-black">Total: {totalPrice}€</p>
                            </div>
                            <button
                                type="submit"
                                disabled={!selectedTime || isBookingLoading}
                                className="bg-black text-white px-16 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-gold-500 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-20 disabled:scale-100"
                            >
                                {isBookingLoading ? 'PROCESANDO...' : 'RESERVAR AHORA'}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>

            {isSelectingExtraServices && !isMobile && ExtraServicesView}
        </div>
    )

    const MobileLayout = (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
            {isSelectingExtraServices ? ServiceSelectionContent : (
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="px-6 py-8 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-20">
                        <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft /></button>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Reservar Cita</h1>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="text-gray-400" /></button>
                    </header>

                    <main className="flex-grow overflow-y-auto custom-scrollbar px-6 pb-44 space-y-12">
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">PERSONAL</h3>
                            <div className="flex space-x-6 overflow-x-auto no-scrollbar py-10 -my-10 -mx-2 px-2">
                                {staffPool.map((s) => (
                                    <button key={s.id} type="button" onClick={() => setSelectedStaff(s)} className="flex-shrink-0 flex flex-col items-center space-y-3">
                                        <div className={`relative p-1 rounded-full transition-all ${selectedStaff.id === s.id ? 'ring-4 ring-gold-400 ring-offset-4' : 'grayscale'}`}>
                                            <img src={s.avatar_url || s.avatar} className="w-16 h-16 rounded-full object-cover" alt="" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{s.name}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">FECHA - {selectedDate.toLocaleDateString('es-ES', { month: 'long' })}</h3>
                            <div className="flex space-x-4 overflow-x-auto no-scrollbar py-10 -my-10 -mx-2 px-2">
                                {days.map((date, i) => {
                                    const isSelected = date.toDateString() === selectedDate.toDateString()
                                    return (
                                        <button key={i} type="button" onClick={() => setSelectedDate(date)} className={`flex-shrink-0 w-16 h-24 rounded-3xl flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-black text-white shadow-xl scale-110' : 'bg-gray-50 text-gray-400'}`}>
                                            <span className="text-[9px] font-bold uppercase opacity-60">{date.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 1)}</span>
                                            <span className="text-xl font-black">{date.getDate()}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">HORA</h3>
                            <div className="grid grid-cols-3 gap-3 p-4 -m-4 overflow-visible">
                                {allTimeSlots.map(({ time }) => {
                                    const isAvailable = availableSlots.includes(time);
                                    const isSelected = selectedTime === time;
                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            disabled={!isAvailable}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-4 rounded-2xl border text-xs font-black transition-all ${isSelected
                                                ? 'bg-gold-500 border-gold-500 text-white shadow-lg'
                                                : isAvailable
                                                    ? 'bg-white border-gray-100 text-gray-400'
                                                    : 'bg-gray-50 border-transparent text-gray-200 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    )
                                })}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">TUS DATOS</h3>
                            <div className="space-y-4">
                                <input name="customer_name" required placeholder="Nombre Completo" className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-black focus:ring-2 focus:ring-gold-200" />
                                <input name="customer_email" type="email" required placeholder="Correo Electrónico" className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-black focus:ring-2 focus:ring-gold-200" />
                                <textarea name="notes" placeholder="Notas (opcional)" className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium min-h-[100px] focus:ring-2 focus:ring-gold-200" />
                            </div>
                        </section>

                        <section className="space-y-6 pb-20">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600">RESUMEN</h3>
                            <div className="space-y-4">
                                {selectedServices.map(s => (
                                    <div key={s.id} className="bg-gray-50 rounded-[2rem] p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-black text-xl italic">{s.name}</h4>
                                            <span className="font-black">{s.price}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center space-x-2">
                                                <img src={selectedStaff.avatar_url || selectedStaff.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                <span className="text-[10px] font-black uppercase text-gray-400">{selectedStaff.name}</span>
                                            </div>
                                            {selectedServices.length > 1 ? (
                                                <button type="button" onClick={() => removeService(s.id)} className="text-[10px] font-black uppercase text-red-500">Eliminar</button>
                                            ) : (
                                                <button type="button" onClick={() => { setServiceToReplaceId(s.id); setIsSelectingExtraServices(true); }} className="text-[10px] font-black uppercase text-gold-600">Cambiar Servicio</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>

                    <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 p-8 z-50 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
                        <input type="hidden" name="date" value={format(selectedDate, 'yyyy-MM-dd')} />
                        <input type="hidden" name="time" value={selectedTime || ''} />
                        <input type="hidden" name="staff_id" value={selectedStaff.id || ''} />
                        <input type="hidden" name="services" value={JSON.stringify(selectedServices.map(s => s.name))} />

                        {bookingError && (
                            <div className="mb-4 text-center text-[9px] font-black text-red-500 uppercase tracking-widest">{bookingError}</div>
                        )}

                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em]">{selectedServices.length} Servicios • {totalDuration} min</p>
                                <p className="text-4xl font-black italic tracking-tighter">Total: {totalPrice}€</p>
                            </div>
                            <button
                                type="submit"
                                disabled={!selectedTime || isBookingLoading}
                                className="bg-black text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl disabled:opacity-20 disabled:scale-100"
                            >
                                {isBookingLoading ? '...' : 'RESERVAR'}
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-300 font-medium leading-relaxed">
                            Confirmación vía <span className="text-gold-500 font-bold underline">email</span> necesaria.
                        </p>
                    </footer>
                </form>
            )}
        </div>
    )

    return isMobile ? MobileLayout : DesktopLayout
}

