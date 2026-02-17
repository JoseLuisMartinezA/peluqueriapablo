
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AdminCalendar from '@/components/AdminCalendar'
import { ShieldCheck, Activity, Users, Settings, Briefcase, MapPin, Scissors } from 'lucide-react'

import AdminCMS from '../../components/admin/AdminCMS'
import AdminBookings from '../../components/admin/AdminBookings'

async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null
    return await verifyToken(token) as any
}


export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const sp = await searchParams
    const session = await getSession()
    const currentTab = sp.tab || 'bookings'

    if (!session) redirect('/login')

    // Check role OR specific email (legacy)
    const isAdmin = session.role === 'admin' || session.email === 'peluqueriapablo.contact@gmail.com' || session.email === 'barbershop'

    if (!isAdmin) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center bg-white p-16 rounded-[40px] shadow-sm max-w-md border border-gray-100">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-100">
                        <ShieldCheck className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-black font-playfair mb-4 text-gray-900 leading-tight uppercase">ACCESO <br /> DENEGADO</h1>
                    <p className="text-gray-500 font-medium">Esta sección es exclusiva para el administrador.</p>
                </div>
            </main>
        )
    }

    // Fetch All Data
    const appointmentsResult = await db.execute(`
        SELECT 
            a.id, 
            a.customer_name,
            a.customer_email,
            a.start_time, 
            a.end_time,
            a.status, 
            a.services,
            a.notes,
            a.staff_id,
            u.full_name as user_name,
            s.name as staff_name
        FROM appointments a 
        LEFT JOIN users u ON a.user_id = u.id 
        LEFT JOIN staff s ON a.staff_id = s.id
        ORDER BY a.start_time DESC
    `)

    const servicesResult = await db.execute(`SELECT * FROM services ORDER BY category ASC`)
    const staffResult = await db.execute(`SELECT * FROM staff ORDER BY name ASC`)
    const locationsResult = await db.execute(`SELECT * FROM locations ORDER BY name ASC`)



    const settingsResult = await db.execute(`SELECT * FROM settings`)
    const portfolioResult = await db.execute(`SELECT * FROM portfolio_images`)

    const appointments = JSON.parse(JSON.stringify(appointmentsResult.rows))
    const services = JSON.parse(JSON.stringify(servicesResult.rows))
    const staff = JSON.parse(JSON.stringify(staffResult.rows))
    const locations = JSON.parse(JSON.stringify(locationsResult.rows))
    const settings = JSON.parse(JSON.stringify(settingsResult.rows))
    const portfolio = JSON.parse(JSON.stringify(portfolioResult.rows))

    const tabs = [
        { id: 'bookings', label: 'Reservas', icon: Scissors },
        { id: 'services', label: 'Servicios', icon: Briefcase },
        { id: 'staff', label: 'Equipo', icon: Users },
        { id: 'content', label: 'Contenido', icon: MapPin },
    ]

    return (
        <main className="min-h-screen bg-gray-50 pb-32">
            <Navbar userEmail={session.email} />


            <div className="pt-28 pb-12 px-4 max-w-7xl mx-auto">
                <header className="mb-12 animate-slide-up flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center space-x-3 text-gold-600 mb-4 bg-white w-fit px-6 py-2 rounded-full shadow-sm border border-gold-100">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-[0.4em]">ADMIN CONTROL</span>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 leading-none">PANEL DE CONTROL</h1>
                    </div>

                    <nav className="flex bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <a
                                key={tab.id}
                                href={`/admin?tab=${tab.id}`}
                                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === tab.id
                                    ? 'bg-black text-white shadow-xl scale-105'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </a>
                        ))}
                    </nav>
                </header>

                <div className="animate-fade-in [animation-delay:200ms] space-y-8">
                    {currentTab === 'bookings' && (
                        <div className="space-y-12">
                            <AdminCalendar initialAppointments={appointments} />

                            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-black/5 border border-gray-100">
                                <AdminBookings appointments={appointments} staff={staff} />
                            </div>
                        </div>
                    )}

                    {currentTab !== 'bookings' && (

                        <AdminCMS
                            tab={currentTab}
                            services={services}
                            staff={staff}
                            locations={locations}
                            settings={settings}
                            portfolio={portfolio}
                        />
                    )}
                </div>
            </div>
        </main>
    )
}
