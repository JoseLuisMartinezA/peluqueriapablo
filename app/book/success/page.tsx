
import Link from 'next/link';
import { CheckCircle, Mail, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function BookingSuccessPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-40 md:py-60 text-center animate-fade-in">
                <div className="mb-16 relative">
                    <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 relative z-10 border border-green-100 shadow-inner">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black font-playfair uppercase mb-8 tracking-tighter text-gray-900 leading-none">¡Casi hecho!</h1>

                <div className="bg-gray-50 p-10 md:p-16 rounded-[48px] border border-gray-100 mb-12 shadow-sm">
                    <div className="flex items-center justify-center space-x-4 text-gold-600 mb-8 font-black uppercase tracking-[0.4em] text-[11px]">
                        <Mail className="w-5 h-5" />
                        <span>Verificación Pendiente</span>
                    </div>

                    <p className="text-gray-500 text-xl font-medium leading-relaxed mb-10">
                        Para asegurar tu turno, hemos enviado un <strong>enlace de confirmación</strong> a tu correo electrónico.
                    </p>

                    <div className="px-8 py-6 bg-white rounded-3xl border border-gray-100 flex items-center space-x-6 text-left shadow-sm">
                        <div className="p-3 bg-gold-400 rounded-2xl">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            Asegúrate de revisar tu carpeta de <br /> <span className="text-gray-900">Spam o Promociones</span> si no lo ves.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href="/dashboard"
                        className="px-12 py-5 gold-gradient text-white font-black rounded-2xl hover:scale-105 transition-all text-xs uppercase tracking-widest flex items-center group shadow-xl"
                    >
                        <span>MIS CITAS</span>
                        <ChevronRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/"
                        className="px-10 py-5 bg-gray-100 text-gray-400 hover:text-gray-900 font-black transition-all text-[11px] uppercase tracking-widest rounded-2xl"
                    >
                        Volver a Inicio
                    </Link>
                </div>
            </div>
        </main>
    );
}
