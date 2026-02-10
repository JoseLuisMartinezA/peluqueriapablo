
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AdminCalendar from '@/components/AdminCalendar'
import { ShieldCheck, Activity, Users } from 'lucide-react'

const ADMIN_EMAILS = ['peluqueriapablo.contact@gmail.com']

async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null
    return await verifyToken(token) as any
}

export default async function AdminPage() {
    const session = await getSession()

    if (!session) redirect('/login')

    if (!ADMIN_EMAILS.includes(session.email as string)) {
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

    const result = await db.execute(`
        SELECT a.id, a.start_time, a.status, u.full_name as user_name 
        FROM appointments a 
        JOIN users u ON a.user_id = u.id 
        ORDER BY start_time ASC
    `)

    const appointments = result.rows.map(row => ({
        id: row.id,
        start_time: row.start_time,
        status: row.status,
        user_name: row.user_name
    })) as any[]

    return (
        <main className="min-h-screen bg-gray-50 pb-32">
            <Navbar userEmail={session.email} />

            <div className="pt-8 pb-12 px-4 max-w-7xl mx-auto">
                <header className="mb-12 animate-slide-up flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center space-x-3 text-gold-600 mb-4 bg-white w-fit px-6 py-2 rounded-full shadow-sm border border-gold-100">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-[0.4em]">ADMIN CONTROL</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black font-playfair uppercase tracking-tighter text-gray-900 leading-none">Reservas</h1>
                        <p className="text-gray-400 text-sm mt-4 font-black uppercase tracking-widest flex items-center gap-3">
                            <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                            Sincronizado en tiempo real
                        </p>
                    </div>


                </header>

                <div className="animate-fade-in [animation-delay:200ms] space-y-8">
                    <AdminCalendar initialAppointments={appointments} />

                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-between animate-slide-up">
                        <div className="flex items-center space-x-6">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-gray-900" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-1">Resumen de Actividad</span>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Reservas Totales Actuales</h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-5xl md:text-7xl font-black text-gold-600 tracking-tighter">{appointments.length}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mt-2">Reservas</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
