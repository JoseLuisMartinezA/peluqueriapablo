
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
    Scissors, MapPin, Phone, Instagram, Facebook, Clock,
    Wifi, Car, Accessibility, Star, ChevronRight,
    Briefcase, Share2, ShieldCheck, Heart, Users, Globe
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import BookingModal from '@/components/BookingModal'
import MyAppointmentsModal from '@/components/MyAppointmentsModal'



interface HomeContentProps {
    initialServices: any[]
    initialStaff: any[]
    initialLocations: any[]
    initialSettings: any[]
    initialPortfolio: any[]
    searchParams?: { confirmed?: string; already_confirmed?: string }
}

export default function HomeContent({ initialServices, initialStaff, initialLocations, initialSettings, initialPortfolio, searchParams }: HomeContentProps) {
    const [isMobile, setIsMobile] = useState(false)
    const [activeTab, setActiveTab] = useState('services')
    const [isOpen, setIsOpen] = useState(true)
    const [isBookingOpen, setIsBookingOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<any | null>(null)
    const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false)
    const navRef = useRef<HTMLDivElement>(null)
    const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null)

    useEffect(() => {
        if (searchParams?.confirmed) {
            setConfirmationMessage('¡Cita Confirmada Exitosamente!')
        } else if (searchParams?.already_confirmed) {
            setConfirmationMessage('Esta cita ya estaba confirmada.')
        }
    }, [searchParams])

    const getSetting = (key: string, fallback: string) => initialSettings.find(s => s.key === key)?.value || fallback

    const location = initialLocations[0] || { name: 'Barbershop', address: 'C. Real, 12, Madrid', phone: '+34 123 456 789', schedule: 'Lunes a Viernes: 10:00 - 20:00' }

    const heroTitle = getSetting('hero_title', location.name)
    const heroSubtitle = getSetting('hero_subtitle', 'Excelencia en cada corte')
    const heroImage = getSetting('hero_image', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')
    const aboutText = getSetting('about_text', 'Una barbería con alma. Fusionamos las técnicas más clásicas con los estilos más vanguardistas para que luzcas tu mejor versión.')

    const instagramUrl = getSetting('instagram_url', '#')
    const facebookUrl = getSetting('facebook_url', '#')
    const mapsUrl = getSetting('google_maps_url', '#')

    const portfolioImages = initialPortfolio.length > 0 ? initialPortfolio : [
        { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop', tag: 'Corte' },
        { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop', tag: 'Barba' },
        { url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop', tag: 'Local' },
        { url: 'https://images.unsplash.com/photo-1592647425447-1811e58e6e0d?q=80&w=600&auto=format&fit=crop', tag: 'Equipo' },
    ]

    const handleServiceClick = (service: any) => {
        setSelectedService(service)
        setIsBookingOpen(true)
    }

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const amenities = [
        { icon: <Car className="w-5 h-5" />, label: 'Parking Fácil' },
        { icon: <Wifi className="w-5 h-5" />, label: 'Wi-Fi Gratuito' },
        { icon: <Accessibility className="w-5 h-5" />, label: 'Acceso Adaptado' },
        { icon: <ShieldCheck className="w-5 h-5" />, label: 'Servicio Seguro' },
    ]

    const reviews = [
        { id: '1', user: 'Carlos M.', rating: 5, comment: 'El mejor corte que me han hecho en años. Muy profesionales.', date: 'Hace 2 días' },
        { id: '2', user: 'Juan P.', rating: 4, comment: 'Excelente ambiente y trato de diez. Repetiré seguro.', date: 'Hace 1 semana' },
        { id: '3', user: 'David R.', rating: 5, comment: 'Atención al detalle y puntualidad. 100% recomendado.', date: 'Hace 2 semanas' },
    ]


    const days = [
        { label: 'Lunes', key: 'schedule_monday' },
        { label: 'Martes', key: 'schedule_tuesday' },
        { label: 'Miércoles', key: 'schedule_wednesday' },
        { label: 'Jueves', key: 'schedule_thursday' },
        { label: 'Viernes', key: 'schedule_friday' },
        { label: 'Sábado', key: 'schedule_saturday' },
        { label: 'Domingo', key: 'schedule_sunday' },
    ]

    return (
        <main className={isMobile ? "min-h-screen bg-white pb-32" : "min-h-screen bg-gray-50 pb-20"}>
            {!isMobile ? (
                <div className="selection:bg-gold-200 selection:text-gold-900">
                    <Navbar onMyAppointmentsClick={() => setIsMyAppointmentsOpen(true)} />
                    {/* ... (rest of the desktop hero/content) */}
                    <section className="relative h-[65vh] overflow-hidden group">
                        <img
                            src={heroImage}
                            alt="Barbershop"
                            className="w-full h-full object-cover grayscale brightness-[0.35] transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <h1 className="text-8xl md:text-[8rem] font-black text-white italic tracking-tighter uppercase mb-4 drop-shadow-2xl animate-slide-up">
                                {heroTitle}
                            </h1>
                            <div className="w-32 h-1.5 bg-gold-400 mb-8 animate-slide-up [animation-delay:200ms]"></div>
                            <p className="text-2xl text-gold-100 font-black tracking-[0.5em] uppercase drop-shadow-lg animate-slide-up [animation-delay:400ms]">
                                {heroSubtitle}
                            </p>
                        </div>
                    </section>

                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-24 relative z-10">
                        <div className="lg:col-span-2 space-y-12">
                            <section id="services-pc" className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 border border-white">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h2 className="text-5xl font-black tracking-tighter uppercase italic mb-2">Servicios</h2>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Selección Premium</p>
                                    </div>
                                    <div className="p-4 bg-gold-50 rounded-3xl">
                                        <Scissors className="w-8 h-8 text-gold-500" />
                                    </div>
                                </div>

                                <div className="space-y-16">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600 mb-8 flex items-center">
                                            <span className="mr-4">MÁS POPULARES</span>
                                            <div className="h-px bg-gold-100 flex-grow"></div>
                                        </h3>
                                        <div className="grid gap-6">
                                            {initialServices.filter(s => s.popular).map(service => (
                                                <div
                                                    key={service.id}
                                                    onClick={() => handleServiceClick(service)}
                                                    className="flex items-center justify-between p-8 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-gold-300 hover:bg-white transition-all group cursor-pointer shadow-sm hover:shadow-xl"
                                                >
                                                    <div className="flex items-center space-x-6">
                                                        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-lg">
                                                            {service.name[0]}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-2xl tracking-tight">{service.name}</h4>
                                                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">{service.duration}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-6">
                                                        <span className="text-4xl font-black tracking-tighter text-gray-900">{service.price}</span>
                                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 group-hover:bg-gold-400 group-hover:border-gold-400 transition-all">
                                                            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-600 mb-8 flex items-center">
                                            <span className="mr-4">CARTA COMPLETA</span>
                                            <div className="h-px bg-gold-100 flex-grow"></div>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                            {initialServices.map(service => (
                                                <div
                                                    key={service.id}
                                                    onClick={() => handleServiceClick(service)}
                                                    className="flex items-center justify-between py-5 border-b border-gray-100 group hover:border-gold-400 transition-colors cursor-pointer"
                                                >
                                                    <div>
                                                        <span className="font-bold text-lg text-gray-800 group-hover:text-black transition-colors">{service.name}</span>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{service.duration}</p>
                                                    </div>
                                                    <span className="font-black text-xl text-gold-700 tracking-tighter">{service.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-black text-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                    <Scissors className="w-64 h-64 text-white" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter uppercase mb-10 relative">Establecimiento</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
                                    {amenities.map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center p-8 bg-white/5 backdrop-blur-sm rounded-[2rem] space-y-4 hover:bg-white/10 transition-colors border border-white/5">
                                            <div className="text-gold-400 p-3 bg-white/5 rounded-2xl">{item.icon}</div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 border border-white">
                                <div className="flex items-center justify-between mb-12">
                                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Reseñas</h2>
                                    <div className="flex items-center space-x-2 bg-gold-50 px-6 py-3 rounded-full">
                                        <span className="text-gold-700 font-black text-xl">4.9</span>
                                        <div className="flex items-center space-x-1">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {reviews.map(review => (
                                        <div key={review.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:shadow-lg transition-shadow">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gold-400 text-white rounded-full flex items-center justify-center font-black">
                                                        {review.user[0]}
                                                    </div>
                                                    <span className="font-black text-xl italic">{review.user}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{review.date}</span>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed font-medium italic">"{review.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-8 lg:sticky lg:top-24 h-fit pb-10">
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-50 space-y-10">
                                <div className="text-center">
                                    <div className="inline-block px-4 py-1 bg-gold-50 text-gold-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
                                        Votada #1 en el barrio
                                    </div>
                                    <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">{location.name}</h2>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">{location.address}</p>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-gold-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">MAPA</h3>
                                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block aspect-square bg-gray-100 rounded-[2rem] overflow-hidden relative shadow-inner group">
                                            <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Map" />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="bg-white text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">Ver en Maps</button>
                                            </div>
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`p-5 rounded-[1.5rem] flex items-center justify-center space-x-3 ${isOpen ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                            <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                            <span className="text-xs font-black uppercase tracking-widest">{isOpen ? 'Abierto' : 'Cerrado'}</span>
                                        </div>
                                        <button className="bg-gray-50 hover:bg-gold-50 p-5 rounded-[1.5rem] flex items-center justify-center transition-colors group">
                                            <Share2 className="w-6 h-6 text-gray-400 group-hover:text-gold-600" />
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="text-gold-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">QUIÉNES SOMOS</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                            {aboutText}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-gold-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6">NUESTROS EXPERTOS</h3>
                                        <div className="flex -space-x-4">
                                            {initialStaff.map((emp, i) => (
                                                <div key={i} className="group relative">
                                                    <img src={emp.avatar_url} className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg" alt={emp.name} />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-black text-white px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-xl scale-90 group-hover:scale-100">
                                                        <p className="text-[10px] font-black uppercase tracking-widest">{emp.name}</p>
                                                        <p className="text-[8px] text-gold-400 font-bold uppercase tracking-widest">Master</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-gold-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6">HORARIO</h3>
                                        <div className="bg-gray-50 rounded-[2rem] p-8 space-y-4">
                                            {days.map((day) => (
                                                <div key={day.key} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-gray-400">{day.label}</span>
                                                    <span className="text-gray-900">{getSetting(day.key, 'Cerrado')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-gray-100 flex justify-center space-x-10 text-gray-400">
                                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram className="w-6 h-6 hover:text-gold-600 transition-colors" /></a>
                                        <a href={facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook className="w-6 h-6 hover:text-gold-600 transition-colors" /></a>
                                        <Globe className="w-6 h-6 hover:text-gold-600 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            ) : (
                <div className="selection:bg-gold-100 selection:text-gold-900">
                    <section className="relative h-[35vh] overflow-hidden">
                        <img
                            src={heroImage}
                            className="w-full h-full object-cover"
                            alt="Carousel"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6">
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">{heroTitle}</h1>
                        </div>
                    </section>

                    <section className="px-6 py-6 text-center animate-fade-in">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-3">{location.address}</p>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                            <div className="flex items-center space-x-0.5">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />)}
                            </div>
                            <span className="text-xs font-black ml-1.5 mt-0.5 tracking-widest">4.9/5</span>
                        </div>
                    </section>

                    <nav className="sticky top-0 z-40 bg-white border-y border-gray-100">
                        <div
                            ref={navRef}
                            className="flex items-center overflow-x-auto scrollbar-hide px-4 py-4 space-x-8 no-scrollbar"
                        >
                            {[
                                { id: 'services', label: 'Servicios' },
                                { id: 'appointments', label: 'Mis Citas' },
                                { id: 'reviews', label: 'Reseñas' },
                                { id: 'portfolio', label: 'Portafolio' },
                                { id: 'details', label: 'Detalles' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex-shrink-0 text-xs font-black uppercase tracking-[0.25em] transition-all relative py-1 ${activeTab === item.id ? 'text-gold-600' : 'text-gray-400'
                                        }`}
                                >
                                    {item.label}
                                    {activeTab === item.id && (
                                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-400 rounded-full animate-in fade-in zoom-in duration-300"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="p-6">
                        {activeTab === 'services' && (
                            <div className="space-y-12 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gold-600">Servicios Populares</h2>
                                    <div className="h-px bg-gold-100 flex-grow ml-6"></div>
                                </div>

                                <div className="space-y-6">
                                    {initialServices.filter(s => s.popular).map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => handleServiceClick(service)}
                                            className="p-8 bg-black text-white rounded-[2.5rem] shadow-2xl flex justify-between items-center active:scale-95 transition-transform"
                                        >
                                            <div>
                                                <h4 className="font-black text-2xl italic tracking-tight mb-1">{service.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{service.duration}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-3xl font-black tracking-tighter text-gold-400">{service.price}</span>
                                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                                                    <ChevronRight className="w-5 h-5 text-gray-300" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gold-600">Otros Servicios</h2>
                                    <div className="h-px bg-gold-100 flex-grow ml-6"></div>
                                </div>

                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden divide-y divide-gray-50">
                                    {initialServices.map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => handleServiceClick(service)}
                                            className="p-8 flex justify-between items-center active:bg-gray-50 transition-colors"
                                        >
                                            <div>
                                                <h4 className="font-black text-lg text-gray-800">{service.name}</h4>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{service.duration}</span>
                                            </div>
                                            <span className="font-black text-2xl text-gold-700 tracking-tighter">{service.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'appointments' && (
                            <div className="space-y-6 pt-6 animate-fade-in">
                                <div className="bg-gradient-to-br from-gold-400 to-gold-600 rounded-[3rem] p-10 text-center text-white shadow-2xl">
                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-3">Mis Citas</h3>
                                    <p className="text-gold-100 font-medium mb-8">Consulta y gestiona tus reservas</p>
                                    <button
                                        onClick={() => setIsMyAppointmentsOpen(true)}
                                        className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                                    >
                                        Ver Mis Citas
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-6 pt-6 animate-fade-in">
                                {reviews.map(review => (
                                    <div key={review.id} className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 gold-gradient text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                                                    {review.user[0]}
                                                </div>
                                                <span className="font-black italic text-2xl">{review.user}</span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{review.date}</span>
                                        </div>
                                        <p className="text-gray-600 text-lg leading-relaxed font-medium italic mb-6">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'portfolio' && (
                            <div className="space-y-6 pt-6 animate-fade-in">
                                <div className="grid grid-cols-2 gap-6">
                                    {(initialPortfolio.length > 0 ? initialPortfolio : portfolioImages).map((img: any, i: number) => (
                                        <div key={i} className="group aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                                            <img src={img.image_url || img.url} className="w-full h-full object-cover transition-transform duration-700" alt={`Corte ${i}`} />
                                            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[8px] font-black uppercase text-white tracking-widest border border-white/20">{img.tag}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="space-y-12 pt-6 animate-fade-in">
                                <section>
                                    <div className="aspect-square bg-gray-100 rounded-[4rem] mb-10 overflow-hidden relative shadow-2xl">
                                        <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover brightness-75" alt="Map" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-10 left-8 right-8 bg-white p-8 rounded-[3rem] flex items-center justify-between shadow-2xl active:scale-95 transition-transform">
                                            <div className="flex items-center space-x-6">
                                                <div className="p-5 gold-gradient rounded-[2rem] shadow-xl text-white">
                                                    <MapPin />
                                                </div>
                                                <p className="text-lg font-black text-gray-900 tracking-tight italic">Maps</p>
                                            </div>
                                        </a>
                                    </div>
                                </section>

                                <section className="bg-black text-white rounded-[4rem] p-12 space-y-12">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <Clock className="w-6 h-6 text-gold-400" />
                                        <h3 className="text-gold-400 text-[10px] font-black uppercase tracking-[0.5em]">Horario</h3>
                                    </div>
                                    <div className="space-y-4 px-2">
                                        {days.map((day) => (
                                            <div key={day.key} className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                                                <span className="text-gray-400">{day.label}</span>
                                                <span className="text-gray-100">{getSetting(day.key, 'Cerrado')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            )}


            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                service={selectedService}
                servicesPool={initialServices}
                staffPool={initialStaff}
            />

            <MyAppointmentsModal
                isOpen={isMyAppointmentsOpen}
                onClose={() => setIsMyAppointmentsOpen(false)}
            />

            {confirmationMessage && (
                <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="max-w-md space-y-10">
                        <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                            <ShieldCheck className="w-16 h-16 text-white" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-tight">{confirmationMessage}</h2>
                            <p className="text-gray-400 font-medium leading-relaxed">Te esperamos en nuestra barbería.</p>
                        </div>
                        <button onClick={() => setConfirmationMessage(null)} className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}
