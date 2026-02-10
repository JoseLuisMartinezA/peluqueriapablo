
'use client'

import { useActionState, Suspense } from 'react'
import { useFormStatus } from 'react-dom'
import { resetPassword } from '@/app/actions'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Save, CheckCircle } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full gold-gradient text-white p-5 rounded-[22px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl text-xs"
        >
            {pending ? 'Guardando...' : 'Cambiar Contraseña'}
        </button>
    )
}

const initialState = {
    error: '',
    success: false
}

function ResetForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [state, formAction] = useActionState(resetPassword, initialState)

    if (!token) {
        return (
            <div className="text-center p-12 bg-white rounded-[48px] shadow-xl border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">Link Inválido</h2>
                <p className="text-gray-500 mb-8">Parece que el enlace de recuperación no es correcto o ha expirado.</p>
                <Link href="/forgot-password" title="Solicitar nuevo link" className="text-gold-600 font-black uppercase tracking-widest text-[10px]">Solicitar nuevo link</Link>
            </div>
        )
    }

    if (state?.success) {
        return (
            <div className="text-center p-12 bg-white rounded-[48px] shadow-xl border border-gray-100 animate-fade-in">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">¡CAMBIADA!</h2>
                <p className="text-gray-500 mb-10">Tu contraseña ha sido actualizada correctamente.</p>
                <Link
                    href="/login"
                    className="inline-block px-12 py-5 gold-gradient text-white font-black rounded-[22px] hover:scale-105 transition-all shadow-xl uppercase tracking-widest text-xs"
                >
                    ENTRAR AHORA
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white p-12 md:p-20 rounded-[48px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative">
            <div className="text-center mb-14">
                <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-5xl font-black font-playfair uppercase tracking-tight text-gray-900 mb-3 leading-none">
                    Nueva Clave
                </h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    Elige tu nueva clave de acceso
                </p>
            </div>

            <form action={formAction} className="space-y-8">
                <input type="hidden" name="token" value={token} />

                <div className="relative group">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 ml-2">Nueva Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gold-500 transition-colors" />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="w-full bg-gray-50 border border-gray-100 rounded-[22px] px-14 py-5 text-gray-900 focus:outline-none focus:bg-white focus:border-gold-400/50 transition-all placeholder:text-gray-300 font-bold shadow-inner"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                </div>

                {state?.error && (
                    <div className="p-5 bg-red-50 border border-red-100 text-red-500 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest">
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

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-white flex flex-col justify-center relative overflow-hidden px-4">
            <div className="absolute top-0 right-0 w-full h-full bg-gray-50/50 pointer-events-none" />
            <div className="w-full max-w-lg mx-auto z-10 animate-fade-in text-gray-900">
                <Suspense fallback={<div className="text-center">Cargando...</div>}>
                    <ResetForm />
                </Suspense>
            </div>
        </main>
    )
}
