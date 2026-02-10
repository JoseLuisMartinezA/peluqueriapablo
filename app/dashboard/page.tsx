
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Calendar, Clock, CheckCircle, AlertCircle, Trash2, ChevronRight, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null
    return await verifyToken(token) as any
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'confirmed') {
        return (
            <div className="flex items-center space-x-2 bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100 shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-wider">Confirmada</span>
            </div>
        )
    }
    return (
        <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full border border-yellow-100 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Pendiente Mail</span>
        </div>
    )
}

export default async function DashboardPage() {
    const session = await getSession()

    if (!session) redirect('/login')

    const isAdmin = session.email === 'peluqueriapablo.contact@gmail.com'
    if (isAdmin) redirect('/admin')

    const userResult = await db.execute({
        sql: 'SELECT full_name FROM users WHERE id = ?',
        args: [session.userId]
    })
    const user = userResult.rows[0] as any

    const result = await db.execute({
        sql: 'SELECT * FROM appointments WHERE user_id = ? ORDER BY start_time DESC',
        args: [session.userId]
    })

    const appointments = result.rows.map(row => ({
        id: row.id,
        start_time: row.start_time,
        status: row.status
    })) as any[]

    return (
        <main className="min-h-screen bg-gray-50 pb-32">
            <Navbar userEmail={session.email} />

            <div className="pt-8 px-4 max-w-2xl mx-auto">
                <header className="mb-10 animate-slide-up">
                    <div className="mb-8 p-8 bg-white rounded-[40px] shadow-sm border border-gray-100 flex items-center space-x-6">
                        <div className="w-16 h-16 gold-gradient rounded-3xl flex items-center justify-center text-white shadow-lg overflow-hidden">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-1">Mi Perfil</span>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user?.full_name || session.email}</h1>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Próximas Citas</h2>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{appointments.length} total</span>
                    </div>
                </header>

                <div className="space-y-4">
                    {appointments.length === 0 ? (
                        <div className="bg-white p-16 rounded-[40px] text-center border-2 border-dashed border-gray-200 animate-fade-in">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs leading-relaxed italic">
                                Aún no tienes citas.<br />Reserva tu primer corte hoy.
                            </p>
                        </div>
                    ) : (
                        appointments.map((apt, i) => {
                            const date = new Date(apt.start_time)
                            return (
                                <div
                                    key={apt.id}
                                    className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between gap-4 animate-slide-up hover:border-gold-200 transition-all group"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="flex flex-col items-center justify-center w-20 h-20 bg-gray-50 rounded-3xl group-hover:bg-gold-400 group-hover:text-white transition-all shadow-inner">
                                            <span className="text-[10px] font-black uppercase tracking-wider mb-1">{format(date, 'MMM', { locale: es })}</span>
                                            <span className="text-2xl font-black leading-none">{format(date, 'd')}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <StatusBadge status={apt.status} />
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-900">
                                                <Clock className="w-4 h-4 text-gold-500" />
                                                <span className="font-black text-xl italic">{format(date, 'HH:mm')}hs</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <CancelButton appointmentId={apt.id} />
                                        <div className="pr-2">
                                            <ChevronRight className="w-5 h-5 text-gray-200" />
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </main>
    )
}

import CancelButton from '@/components/CancelButton'

