
'use client'

import { useActionState, Suspense } from 'react'
import { useFormStatus } from 'react-dom'
import { login, type ActionState } from '@/app/actions'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, LogIn, ChevronLeft } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full gold-gradient text-white p-5 rounded-[22px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl text-xs"
        >
            {pending ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
    )
}

const initialState: ActionState = {
    error: null,
    success: false,
    message: null
}


function LoginForm() {
    const searchParams = useSearchParams()
    const verified = searchParams.get('verified')
    const [state, formAction] = useActionState(login, initialState)

    return (
        <div className="bg-white p-12 md:p-20 rounded-[48px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative">
            <div className="text-center mb-14">
                <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                    <LogIn className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-5xl font-black font-playfair uppercase tracking-tight text-gray-900 mb-3 leading-none">
                    Bienvenido
                </h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    Acceso Clientes & Staff
                </p>
            </div>

            {verified && (
                <div className="mb-10 p-5 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-center font-black uppercase tracking-widest text-[10px] animate-slide-up">
                    ¡Email verificado! Ya puedes entrar.
                </div>
            )}

            <form action={formAction} className="space-y-8">
                <div className="space-y-6">
                    <div className="relative group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 ml-2">Usuario</label>
                        <div className="relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gold-500 transition-colors" />
                            <input
                                id="email"
                                name="email"
                                type="text"
                                required
                                className="w-full bg-gray-50 border border-gray-100 rounded-[22px] px-14 py-5 text-gray-900 focus:outline-none focus:bg-white focus:border-gold-400/50 transition-all placeholder:text-gray-300 font-bold shadow-inner"
                                placeholder="barbershop"
                            />
                        </div>
                    </div>

                    <div className="relative group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 ml-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gold-500 transition-colors" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full bg-gray-50 border border-gray-100 rounded-[22px] px-14 py-5 text-gray-900 focus:outline-none focus:bg-white focus:border-gold-400/50 transition-all placeholder:text-gray-300 font-bold shadow-inner"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                {state?.error && (
                    <div className="p-5 bg-red-50 border border-red-100 text-red-500 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest animate-shake">
                        {state.error}
                    </div>
                )}

                <div className="pt-6">
                    <SubmitButton />
                </div>
            </form>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Cargando...</div>}>
            <main className="min-h-screen bg-white flex flex-col justify-center relative overflow-hidden px-4">
                <div className="absolute top-0 right-0 w-full h-full bg-gray-50/50 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="w-full max-w-lg mx-auto z-10 animate-fade-in">
                    <LoginForm />

                    <p className="text-center text-gray-300 text-[9px] mt-12 uppercase tracking-[0.5em] font-black">
                        Barbershop © 2026 - Confort & Estilo
                    </p>
                </div>
            </main>
        </Suspense>
    )
}
