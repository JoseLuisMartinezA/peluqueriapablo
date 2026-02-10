
'use client'

import { cancelAppointment } from '@/app/actions'
import { Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

export default function CancelButton({ appointmentId }: { appointmentId: number }) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)

    const handleCancel = () => {
        startTransition(async () => {
            const result = await cancelAppointment(appointmentId)
            if (result?.error) {
                alert(result.error)
            }
        })
    }

    if (showConfirm) {
        return (
            <div className="flex items-center space-x-2 animate-fade-in">
                <button
                    disabled={isPending}
                    onClick={() => setShowConfirm(false)}
                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                >
                    No
                </button>
                <button
                    disabled={isPending}
                    onClick={handleCancel}
                    className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-red-500 text-white rounded-full shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
                >
                    {isPending ? '...' : 'Sí, borrar'}
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            title="Cancelar Cita"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    )
}
