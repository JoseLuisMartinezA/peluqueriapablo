
'use client'

import Link from 'next/link'
import { Home, Calendar, User, ShieldCheck, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions'

export default function Navbar({ userEmail }: { userEmail?: string | null }) {
    const pathname = usePathname()
    const isAdmin = userEmail === 'peluqueriapablo.contact@gmail.com'

    // Bottom Navigation Bar
    const BottomNav = (
        <nav className="fixed bottom-0 w-full z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <div className="max-w-md mx-auto flex justify-around items-center h-20">
                {isAdmin ? (
                    // Admin View
                    <>
                        <Link href="/" className={`flex flex-col items-center space-y-1 group ${pathname === '/' ? 'text-gold-600' : 'text-gray-400'}`}>
                            <Home className={`w-6 h-6 transition-transform group-active:scale-90 ${pathname === '/' ? 'stroke-[2.5px]' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Info</span>
                        </Link>
                        <Link href="/admin" className={`flex flex-col items-center space-y-1 group ${pathname === '/admin' ? 'text-gold-600' : 'text-gray-400'}`}>
                            <ShieldCheck className={`w-6 h-6 transition-transform group-active:scale-90 ${pathname === '/admin' ? 'stroke-[2.5px]' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Reservas</span>
                        </Link>
                        <button onClick={() => logout()} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-red-500 transition-colors">
                            <LogOut className="w-6 h-6" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Salir</span>
                        </button>
                    </>
                ) : (
                    // User View
                    <>
                        <Link href="/" className={`flex flex-col items-center space-y-1 group ${pathname === '/' ? 'text-gold-600' : 'text-gray-400'}`}>
                            <Home className={`w-6 h-6 transition-transform group-active:scale-90 ${pathname === '/' ? 'stroke-[2.5px]' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Info</span>
                        </Link>
                        <Link href="/dashboard" className={`flex flex-col items-center space-y-1 group ${pathname === '/dashboard' ? 'text-gold-600' : 'text-gray-400'}`}>
                            <Calendar className={`w-6 h-6 transition-transform group-active:scale-90 ${pathname === '/dashboard' ? 'stroke-[2.5px]' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Citas</span>
                        </Link>
                        {userEmail ? (
                            <button onClick={() => logout()} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-red-500 transition-colors">
                                <LogOut className="w-6 h-6" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Salir</span>
                            </button>
                        ) : (
                            <Link href="/login" className={`flex flex-col items-center space-y-1 group ${pathname === '/login' ? 'text-gold-600' : 'text-gray-400'}`}>
                                <User className={`w-6 h-6 transition-transform group-active:scale-90 ${pathname === '/login' ? 'stroke-[2.5px]' : ''}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Entrar</span>
                            </Link>
                        )}
                    </>
                )}
            </div>
        </nav>
    )

    return (
        <>
            {BottomNav}
        </>
    )
}
