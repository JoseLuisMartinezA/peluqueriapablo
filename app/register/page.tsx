
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { register, type ActionState } from '@/app/actions'
import Link from 'next/link'
import { UserPlus, Mail, Lock, CheckCircle } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full gold-gradient text-white p-5 rounded-[22px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl text-xs"
        >
            {pending ? 'Enviando...' : 'Crear Cuenta'}
        </button>
    )
}

const initialState: ActionState = {
    error: '',
    success: false,
    message: ''
}

export default function RegisterPage() {
    const [state, formAction] = useActionState(register, initialState)

    return (
        <main className="min-h-screen bg-white flex flex-col justify-center relative overflow-hidden px-4">
            <div className="absolute top-0 right-0 w-full h-full bg-gray-50/50 pointer-events-none" />

            <div className="w-full max-w-lg mx-auto z-10 animate-fade-in text-gray-900">
                <div className="bg-white p-12 md:p-20 rounded-[48px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative">
                    <div className="text-center mb-14">
                        <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <UserPlus className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-5xl font-black font-playfair uppercase tracking-tight text-gray-900 mb-3 leading-none">
                            Únete
                        </h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                            Disfruta de ventajas exclusivas
                        </p>
                    </div>

                    {state?.success ? (
                        <div className="text-center animate-fade-in py-8">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100 shadow-inner">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">¡VERIFICA TU EMAIL!</h3>
                            <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                                Te hemos enviado un link de activación. <br />
                                <strong>Confírmalo para poder reservar tu cita.</strong>
                            </p>
                            <Link
                                href="/login"
                                className="inline-block px-12 py-5 gold-gradient text-white font-black rounded-[22px] hover:scale-105 transition-all shadow-xl uppercase tracking-widest text-xs"
                            >
                                IR AL LOGIN
                            </Link>
                        </div>
                    ) : (
                        <form action={formAction} className="space-y-8">
                            <div className="space-y-6">
                                <div className="relative group">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 ml-2">Nombre Completo</label>
                                    <div className="relative">
                                        <UserPlus className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gold-500 transition-colors" />
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-[22px] px-14 py-5 text-gray-900 focus:outline-none focus:bg-white focus:border-gold-400/50 transition-all placeholder:text-gray-300 font-bold shadow-inner"
                                            placeholder="Ej: Juan Pérez"
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 ml-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gold-500 transition-colors" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-[22px] px-14 py-5 text-gray-900 focus:outline-none focus:bg-white focus:border-gold-400/50 transition-all placeholder:text-gray-300 font-bold shadow-inner"
                                            placeholder="ejemplo@correo.com"
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

                            <div className="text-center pt-8">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-4">¿Ya eres cliente?</span>
                                <Link href="/login" className="text-gray-900 hover:text-gold-600 transition-colors font-black uppercase tracking-[0.3em] text-[11px] underline underline-offset-8 decoration-gold-400 decoration-2">
                                    Inicia Sesión
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    )
}
