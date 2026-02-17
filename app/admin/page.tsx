import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AdminCalendar from '@/components/AdminCalendar'
import { ShieldCheck, Users, Briefcase, MapPin, Scissors, LogOut } from 'lucide-react'

import AdminCMS from '../../components/admin/AdminCMS'
import AdminBookings from '../../components/admin/AdminBookings'
import PrivacyGuard from '../../components/admin/PrivacyGuard'

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

    const isAdmin = session.role === 'admin' || session.email === 'peluqueriapablo.contact@gmail.com' || session.email === 'knowme'

    if (!isAdmin) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-200 max-w-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                        <ShieldCheck className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Acceso Restringido</h1>
                    <p className="text-sm text-gray-500 font-medium">No tienes permisos para acceder a esta sección.</p>
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
        { id: 'bookings', label: 'Citas', icon: Scissors },
        { id: 'services', label: 'Servicios', icon: Briefcase },
        { id: 'staff', label: 'Equipo', icon: Users },
        { id: 'content', label: 'Web', icon: MapPin },
    ]

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar userEmail={session.email} />

            <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
                {/* Dashboard Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-2 py-0.5 bg-black text-white rounded text-[8px] font-bold uppercase tracking-widest">
                                Admin
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de Gestión</h1>
                        </div>
                        <p className="text-xs text-gray-500 font-medium lowercase first-letter:uppercase">Vista general de {tabs.find(t => t.id === currentTab)?.label}</p>
                    </div>

                    <nav className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <a
                                key={tab.id}
                                href={`/admin?tab=${tab.id}`}
                                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all min-w-fit ${currentTab === tab.id
                                    ? 'bg-black text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </a>
                        ))}
                    </nav>
                </header>

                {/* Dashboard Content */}
                <div className="space-y-10">
                    {currentTab === 'bookings' && (
                        <div className="grid grid-cols-1 gap-10">
                            <AdminCalendar initialAppointments={appointments} staff={staff} />

                            <div className="border-t border-gray-200 pt-10">
                                <AdminBookings appointments={appointments} staff={staff} />
                            </div>
                        </div>
                    )}

                    {currentTab !== 'bookings' && (
                        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
                            <AdminCMS
                                tab={currentTab}
                                services={services}
                                staff={staff}
                                locations={locations}
                                settings={settings}
                                portfolio={portfolio}
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
