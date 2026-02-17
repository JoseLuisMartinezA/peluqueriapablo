'use client'

import { useState } from 'react'
import {
    Plus, Trash2, Edit2, Check, X, Clock, DollarSign, Tag,
    Image as ImageIcon, MapPin, Instagram, Facebook, Globe, Layout
} from 'lucide-react'
import {
    createService, updateService, deleteService,
    createStaff, deleteStaff, updateLocation,
    updateSettings, addPortfolioImage, deletePortfolioImage
} from '@/app/actions'

export default function AdminCMS({ tab, services, staff, locations, settings, portfolio }: any) {
    if (tab === 'services') return <ServicesTab services={services} />
    if (tab === 'staff') return <StaffTab staff={staff} />
    if (tab === 'content') return <ContentTab locations={locations} settings={settings} portfolio={portfolio} />
    return null
}

// ... ServicesTab and StaffTab remain same ...
function ServicesTab({ services }: { services: any[] }) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-gray-900">Gestión de Servicios</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-black text-white px-8 py-4 rounded-2xl flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all shadow-xl"
                >
                    <Plus className="w-4 h-4" />
                    <span>Añadir Servicio</span>
                </button>
            </div>

            {isAdding && (
                <ServiceForm onCancel={() => setIsAdding(false)} onSubmit={createService} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((s) => (
                    <div key={s.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 group hover:border-gold-300 transition-all">
                        {editingId === s.id ? (
                            <ServiceForm
                                initial={s}
                                onCancel={() => setEditingId(null)}
                                onSubmit={(formData: FormData) => updateService(s.id, formData)}
                            />
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-600 block mb-2">{s.category}</span>
                                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{s.name}</h3>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => setEditingId(s.id)} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-black transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => deleteService(s.id)} className="p-3 bg-red-50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm font-medium leading-relaxed flex-grow">{s.description}</p>
                                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-300" />
                                            <span className="text-[10px] font-black text-gray-900">{s.duration}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="w-4 h-4 text-gray-300" />
                                            <span className="text-xl font-black text-gray-900">{s.price}</span>
                                        </div>
                                    </div>
                                    {s.popular === 1 && <span className="px-4 py-2 bg-gold-50 text-gold-600 rounded-full text-[9px] font-black uppercase tracking-widest">Popular</span>}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function ServiceForm({ initial, onCancel, onSubmit }: any) {
    return (
        <form action={async (formData) => {
            await onSubmit(formData);
            onCancel();
        }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input name="name" defaultValue={initial?.name} placeholder="Nombre del servicio" className="bg-gray-50 border-none rounded-2xl p-6 text-sm font-black uppercase tracking-widest placeholder:text-gray-300 focus:ring-2 focus:ring-gold-200" required />
                <input name="price" defaultValue={initial?.price} placeholder="Precio (ej: 25€)" className="bg-gray-50 border-none rounded-2xl p-6 text-sm font-black uppercase tracking-widest placeholder:text-gray-300 focus:ring-2 focus:ring-gold-200" required />
                <input name="duration" defaultValue={initial?.duration} placeholder="Duración (ej: 30 min)" className="bg-gray-50 border-none rounded-2xl p-6 text-sm font-black uppercase tracking-widest placeholder:text-gray-300 focus:ring-2 focus:ring-gold-200" required />
                <input name="category" defaultValue={initial?.category} placeholder="Categoría" className="bg-gray-50 border-none rounded-2xl p-6 text-sm font-black uppercase tracking-widest placeholder:text-gray-300 focus:ring-2 focus:ring-gold-200" required />
            </div>
            <textarea name="description" defaultValue={initial?.description} placeholder="Descripción..." className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-gold-200 min-h-[120px] resize-none" />

            <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-3 cursor-pointer group">
                    <input type="checkbox" name="popular" value="true" defaultChecked={initial?.popular === 1} className="w-6 h-6 rounded-lg text-gold-500 focus:ring-gold-500 border-gray-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-black">Popular</span>
                </label>
            </div>

            <div className="flex items-center space-x-4">
                <button type="submit" className="bg-green-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Guardar</span>
                </button>
                <button type="button" onClick={onCancel} className="bg-gray-100 text-gray-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Cancelar</button>
            </div>
        </form>
    )
}

function StaffTab({ staff }: { staff: any[] }) {
    const [isAdding, setIsAdding] = useState(false)

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-gray-900">Equipo de Barberos</h2>
                <button onClick={() => setIsAdding(true)} className="bg-black text-white px-8 py-4 rounded-2xl flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all shadow-xl">
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Miembro</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                    <form action={async (fd) => { await createStaff(fd); setIsAdding(false); }} className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <input name="name" placeholder="Nombre completo" className="bg-gray-50 border-none rounded-2xl p-6 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-gold-200" required />
                            <input name="avatar_url" placeholder="URL del Avatar" className="bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-gold-200" required />
                        </div>
                        <div className="flex space-x-4">
                            <button type="submit" className="bg-black text-white px-8 py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Crear</button>
                            <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-100 text-gray-400 px-8 py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest">X</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {staff.map((s) => (
                    <div key={s.id} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 text-center relative group overflow-hidden">
                        <div className="relative mb-6">
                            <img src={s.avatar_url} className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-gray-50 transition-transform group-hover:scale-110" />
                            <button
                                onClick={() => deleteStaff(s.id)}
                                className="absolute top-0 right-0 p-3 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{s.name}</h3>
                        <p className="text-[9px] font-black text-gold-600 mt-2 uppercase tracking-widest">Máster Barbero</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ContentTab({ locations, settings, portfolio }: any) {
    const loc = locations[0]
    const getSetting = (key: string) => settings.find((s: any) => s.key === key)?.value || ''
    const [isAddingPortfolio, setIsAddingPortfolio] = useState(false)

    return (
        <div className="space-y-16">
            {/* 1. Datos del Establecimiento */}
            <section className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100">
                <h3 className="text-[10px] font-black text-gold-600 uppercase tracking-[0.4em] mb-10 flex items-center">
                    <MapPin className="w-4 h-4 mr-3" />
                    UBICACIÓN Y HORARIOS
                </h3>

                <form action={async (fd) => { await updateLocation(loc.id, fd); }} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nombre Comercial</label>
                        <input name="name" defaultValue={loc.name} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-black focus:ring-2 focus:ring-gold-200" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dirección</label>
                        <input name="address" defaultValue={loc.address} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-gold-200" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Teléfono</label>
                        <input name="phone" defaultValue={loc.phone} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-gold-200" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-black text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all shadow-xl">Actualizar Info Básica</button>
                    </div>
                </form>
            </section>

            {/* 1.5. Horarios de Apertura */}
            <section className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100">
                <h3 className="text-[10px] font-black text-gold-600 uppercase tracking-[0.4em] mb-10 flex items-center">
                    <Clock className="w-4 h-4 mr-3" />
                    HORARIOS DE APERTURA
                </h3>
                <form action={async (fd) => { await updateSettings(fd); }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                    {[
                        { key: 'schedule_monday', label: 'Lunes' },
                        { key: 'schedule_tuesday', label: 'Martes' },
                        { key: 'schedule_wednesday', label: 'Miércoles' },
                        { key: 'schedule_thursday', label: 'Jueves' },
                        { key: 'schedule_friday', label: 'Viernes' },
                        { key: 'schedule_saturday', label: 'Sábado' },
                        { key: 'schedule_sunday', label: 'Domingo' },
                    ].map((day) => (
                        <div key={day.key} className="space-y-3">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{day.label}</label>
                            <input name={day.key} defaultValue={getSetting(day.key)} placeholder="Ej: 10:00 - 20:00" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-black focus:ring-2 focus:ring-gold-200" />
                        </div>
                    ))}
                    <div className="md:col-span-2 lg:col-span-4 pt-4 border-t border-gray-50">
                        <button type="submit" className="bg-black text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all shadow-xl">Guardar Todos los Horarios</button>
                    </div>
                </form>
            </section>

            {/* 2. Personalización Web */}
            <section className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100">
                <h3 className="text-[10px] font-black text-gold-600 uppercase tracking-[0.4em] mb-10 flex items-center">
                    <Layout className="w-4 h-4 mr-3" />
                    IDENTIDAD VISUAL Y WEB
                </h3>
                <form action={async (fd) => { await updateSettings(fd); }} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Título Hero</label>
                        <input name="hero_title" defaultValue={getSetting('hero_title')} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-black focus:ring-2 focus:ring-gold-200" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Subtítulo Hero</label>
                        <input name="hero_subtitle" defaultValue={getSetting('hero_subtitle')} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-gold-200" />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Imagen Hero URL</label>
                        <input name="hero_image" defaultValue={getSetting('hero_image')} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-gold-200" />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sobre Nosotros</label>
                        <textarea name="about_text" defaultValue={getSetting('about_text')} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-gold-200 min-h-[120px] resize-none" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Instagram className="w-3 h-3 mr-2" /> Instagram</label>
                        <input name="instagram_url" defaultValue={getSetting('instagram_url')} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-gold-200" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Facebook className="w-3 h-3 mr-2" /> Facebook</label>
                        <input name="facebook_url" defaultValue={getSetting('facebook_url')} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-gold-200" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-black text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all shadow-xl">Guardar Textos y Redes</button>
                    </div>
                </form>
            </section>

            {/* 3. Portafolio */}
            <section className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-[10px] font-black text-gold-600 uppercase tracking-[0.4em] flex items-center">
                        <ImageIcon className="w-4 h-4 mr-3" />
                        PORTAFOLIO DE TRABAJOS
                    </h3>
                    <button onClick={() => setIsAddingPortfolio(true)} className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {isAddingPortfolio && (
                        <div className="bg-gray-50 p-6 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                            <form action={async (fd) => { await addPortfolioImage(fd); setIsAddingPortfolio(false); }} className="space-y-4 w-full">
                                <input name="image_url" placeholder="URL Imagen" className="w-full bg-white border border-gray-100 rounded-xl p-3 text-[10px] font-black" required />
                                <input name="tag" placeholder="Tag (ej: Corte)" className="w-full bg-white border border-gray-100 rounded-xl p-3 text-[10px] font-black" />
                                <div className="flex space-x-2">
                                    <button type="submit" className="flex-grow bg-black text-white p-3 rounded-xl text-[8px] font-black uppercase">Añadir</button>
                                    <button type="button" onClick={() => setIsAddingPortfolio(false)} className="bg-white p-3 rounded-xl text-[8px] font-black uppercase border border-gray-100">X</button>
                                </div>
                            </form>
                        </div>
                    )}
                    {portfolio.map((img: any) => (
                        <div key={img.id} className="relative group rounded-[2.5rem] overflow-hidden aspect-square shadow-sm">
                            <img src={img.image_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => deletePortfolioImage(img.id)} className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="absolute bottom-4 left-4 bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">{img.tag}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
