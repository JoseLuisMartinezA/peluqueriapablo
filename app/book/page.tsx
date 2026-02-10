
'use client'

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { bookAppointment } from '@/app/actions';
import Navbar from '@/components/Navbar';
import { Calendar as CalendarIcon, Clock, CheckCircle, Sparkles } from 'lucide-react';

export default function BookPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const handleDateSelect = async (date: Date | undefined) => {
        setSelectedDate(date);
        setSelectedSlot(null);
        setAvailableSlots([]);

        if (date) {
            setLoadingSlots(true);
            try {
                const res = await fetch(`/api/availability?date=${format(date, 'yyyy-MM-dd')}`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailableSlots(data.slots || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingSlots(false);
            }
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-32 pb-32 px-4 max-w-5xl mx-auto">
                <header className="mb-20 text-center animate-slide-up">
                    <div className="inline-flex items-center space-x-3 text-gold-600 mb-6 px-6 py-2 bg-white rounded-full border border-gold-100 shadow-sm">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Experiencia Premium</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black font-playfair uppercase tracking-tighter text-gray-900 leading-none">Reserva Tu Cita</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-6">Elige el momento perfecto para renovar tu estilo</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Calendar Card */}
                    <div className="lg:col-span-7 bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl animate-slide-up [animation-delay:100ms]">
                        <div className="mb-10 flex items-center space-x-4">
                            <div className="p-3 bg-gold-400 rounded-2xl text-white shadow-md">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <h2 className="font-black uppercase tracking-tight text-xl text-gray-900">Selecciona el Día</h2>
                        </div>

                        <div className="flex justify-center">
                            <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                locale={es}
                                disabled={{ before: new Date() }}
                                className="border-none"
                            />
                        </div>
                    </div>

                    {/* Slots List */}
                    <div className="lg:col-span-5 space-y-8 animate-slide-up [animation-delay:200ms]">
                        {selectedDate ? (
                            <div>
                                <div className="mb-8 flex items-center space-x-4">
                                    <div className="p-3 bg-gray-100 rounded-2xl text-gray-400">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <h2 className="font-black uppercase tracking-tight text-xl text-gray-900">Horas Disponibles</h2>
                                </div>

                                {loadingSlots ? (
                                    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[40px] space-y-6 border border-gray-100 shadow-sm">
                                        <div className="w-10 h-10 border-4 border-gold-100 border-t-gold-400 rounded-full animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Consultando Agenda...</p>
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`py-5 rounded-[24px] font-black transition-all text-sm border-2 ${selectedSlot === slot
                                                        ? 'gold-gradient text-white border-transparent shadow-xl scale-105 z-10'
                                                        : 'bg-white text-gray-400 border-gray-50 hover:border-gold-200 shadow-sm'
                                                    }`}
                                            >
                                                {slot}hs
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-gray-100">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">No hay horarios libres <br /> para este día.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white p-20 rounded-[48px] flex flex-col items-center justify-center text-center space-y-8 shadow-sm border border-gray-100 h-full opacity-60">
                                <div className="p-8 bg-gray-50 rounded-full">
                                    <CalendarIcon className="w-16 h-16 text-gray-200" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 leading-relaxed">
                                    Primer paso: <br />
                                    <span className="text-gray-300">Elige un día en el calendario</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Confirmation Bar */}
                {selectedSlot && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50 animate-slide-up">
                        <div className="bg-white p-6 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-gold-200 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1 h-full gold-gradient" />
                            <div className="flex items-center space-x-6">
                                <div className="p-4 bg-green-50 rounded-2xl text-green-500">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gold-600 mb-1">Confirmar Reserva</p>
                                    <p className="font-black text-2xl text-gray-900 font-playfair">{format(selectedDate!, 'dd MMMM', { locale: es })} • {selectedSlot}hs</p>
                                </div>
                            </div>

                            <form action={bookAppointment} className="w-full sm:w-auto">
                                <input type="hidden" name="date" value={format(selectedDate!, 'yyyy-MM-dd')} />
                                <input type="hidden" name="time" value={selectedSlot} />
                                <button
                                    type="submit"
                                    className="w-full px-12 py-5 gold-gradient text-white font-black rounded-2xl hover:scale-105 transition-all text-xs uppercase tracking-[0.2em] shadow-xl"
                                >
                                    CONFIRMAR AHORA
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
