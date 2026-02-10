
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Scissors, MapPin, Phone, Instagram, Facebook, Clock } from 'lucide-react'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return await verifyToken(token) as any
}

export default async function Home() {
  const session = await getSession()

  return (
    <main className="min-h-screen bg-white pb-24">
      <Navbar userEmail={session?.email} />

      {/* Hero Section */}
      <section className="relative h-[55vh] md:h-[65vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white z-10" />
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop"
            alt="Barber Shop"
            className="w-full h-full object-cover animate-fade-in opacity-50"
          />
        </div>

        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          <div className="mb-4 inline-block px-4 py-1.5 border border-gold-400/20 rounded-full glass animate-slide-up shadow-sm">
            <span className="text-gold-600 text-[9px] md:text-[10px] font-black tracking-[0.3em] uppercase">Estilo Profesional</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-3 animate-slide-up [animation-delay:200ms] leading-[0.85] text-gray-900 tracking-tighter">
            CORTE <br />
            <span className="text-gold-gradient uppercase">CLÁSICO.</span>
          </h1>
          <p className="text-sm md:text-xl text-gray-500 mb-6 max-w-md mx-auto animate-slide-up [animation-delay:400ms] font-medium leading-relaxed">
            Reserva tu cita en segundos. Sin esperas, sin complicaciones.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:600ms]">
            <Link
              href="/book"
              className="w-full sm:w-auto px-12 py-5 gold-gradient text-white font-black rounded-3xl hover:scale-105 transition-all shadow-xl uppercase tracking-widest text-xs"
            >
              RESERVAR AHORA
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-gold-600 font-black text-[9px] uppercase tracking-[0.4em] mb-2 block">Selecciona para Reservar</span>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Nuestro Servicio</h2>
          </div>

          <Link href="/book" className="group block transform transition-all active:scale-95 duration-300">
            <div className="flex items-center justify-between p-6 md:p-10 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 rounded-[40px] transition-all">
              <div className="flex items-center space-x-6 md:space-x-12">
                <div className="w-16 h-16 md:w-32 md:h-32 bg-[#D4A35B] rounded-[24px] md:rounded-[40px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-gold-400/10">
                  <div className="relative w-10 h-10 md:w-20 md:h-20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                      <circle cx="6" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M20 4 8.12 15.88" />
                      <path d="M14.47 14.48 20 20" />
                      <path d="M8.12 8.12 12 12" />
                      <path d="M20 12h-8M20 16h-8M20 8h-8M20 4h-8" className="opacity-30" />
                    </svg>
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl md:text-6xl font-black text-gray-900 leading-none mb-1 md:mb-4 italic tracking-tighter">Corte de pelo.</h3>
                  <p className="text-gray-900 text-lg md:text-3xl font-medium tracking-tight opacity-70">Precisión & Estilo</p>
                </div>
              </div>

              <div className="pr-2 md:pr-10">
                <span className="text-3xl md:text-7xl font-black text-[#0047AB] tracking-tighter">+7€</span>
              </div>
            </div>
          </Link>

          <div className="w-full h-px bg-gray-100 mt-20" />
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 md:py-40 px-6 bg-gray-50/50 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
          <div className="space-y-12 animate-slide-up">
            <div>
              <span className="text-gold-600 font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Visítanos</span>
              <h2 className="text-6xl md:text-9xl font-black text-gray-900 uppercase tracking-tighter leading-[0.8] mb-10">Peluquería <br /> Pablo</h2>
              <p className="text-gray-500 text-xl md:text-2xl font-medium leading-relaxed max-w-sm">Tu confianza es mi mayor compromiso.</p>
            </div>

            <div className="space-y-10">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <MapPin className="w-8 h-8 text-gold-600" />
                </div>
                <p className="text-gray-900 font-bold text-xl md:text-3xl tracking-tight">C. Estilo, 45, Madrid</p>
              </div>
              <a href="tel:+34912345678" className="flex items-center space-x-6 group w-fit">
                <div className="p-4 bg-gold-400 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-gold-400/20">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-900 font-black text-3xl md:text-5xl tracking-tighter">+34 912 345 678</p>
              </a>
            </div>
          </div>

          <div className="relative rounded-[50px] md:rounded-[80px] overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1599351431247-f57933842922?q=80&w=2000&auto=format&fit=crop"
              alt="Interior Peluquería"
              className="w-full h-full object-cover aspect-[4/5] grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 text-center px-4">
        <div className="max-w-xl mx-auto space-y-12">
          <div className="flex items-center justify-center space-x-4">
            <div className="p-2 gold-gradient rounded-xl"><Scissors className="w-6 h-6 text-white" /></div>
            <h2 className="text-4xl font-black text-gray-900 font-playfair uppercase tracking-tighter">PABLO BARBER</h2>
          </div>
          <div className="flex justify-center space-x-12 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
            <a href="#" className="hover:text-gold-600">Instagram</a>
            <a href="#" className="hover:text-gold-600">Facebook</a>
          </div>
          <p className="text-gray-200 text-[9px] font-black uppercase tracking-[0.5em] pt-20">ESTILO & TRADICIÓN © 2026</p>
        </div>
      </footer>
    </main>
  )
}
