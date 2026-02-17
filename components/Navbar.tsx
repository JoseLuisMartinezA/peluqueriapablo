
'use client'

import Link from 'next/link'
import { Home, Calendar, User, ShieldCheck, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions'

export default function Navbar({ userEmail, onMyAppointmentsClick }: { userEmail?: string | null; onMyAppointmentsClick?: () => void }) {
    const pathname = usePathname()
    const isAdmin = userEmail === 'peluqueriapablo.contact@gmail.com'


    return (
        <div className="hidden md:block">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase">Barbershop</Link>

                    <div className="flex items-center space-x-8">
                        {userEmail ? (
                            <div className="flex items-center space-x-6">
                                <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-gold-600 hover:text-black transition-colors">Panel Admin</Link>
                                <button onClick={() => logout()} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">Salir</button>
                            </div>
                        ) : (
                            <button
                                onClick={onMyAppointmentsClick}
                                className="text-sm font-black uppercase tracking-widest text-gray-900 border-2 border-black px-6 py-2 rounded-full hover:bg-black hover:text-white transition-all flex items-center gap-2"
                            >
                                <Calendar className="w-4 h-4" />
                                Mis Citas
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    )
}

