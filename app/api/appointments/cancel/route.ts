import { db } from '@/lib/db'
import { deleteEvent } from '@/lib/google'

export async function POST(request: Request) {
    try {
        const { appointmentId, email } = await request.json()

        if (!appointmentId || !email) {
            return Response.json({ error: 'Datos incompletos' }, { status: 400 })
        }

        // Verificar que la cita pertenece al email proporcionado
        const result = await db.execute({
            sql: 'SELECT id, customer_email, google_event_id FROM appointments WHERE id = ?',
            args: [appointmentId]
        })

        if (result.rows.length === 0) {
            return Response.json({ error: 'Cita no encontrada' }, { status: 404 })
        }

        const appointment = result.rows[0]

        // Verificar que el email coincide
        if (appointment.customer_email !== email) {
            return Response.json({ error: 'No tienes permiso para cancelar esta cita' }, { status: 403 })
        }

        // Eliminar del Google Calendar si existe
        if (appointment.google_event_id) {
            try {
                await deleteEvent(appointment.google_event_id as string)
            } catch (error) {
                console.error('Error deleting from Google Calendar:', error)
            }
        }

        // Eliminar de la base de datos
        await db.execute({
            sql: 'DELETE FROM appointments WHERE id = ?',
            args: [appointmentId]
        })

        return Response.json({ success: true })
    } catch (error) {
        console.error('Error cancelling appointment:', error)
        return Response.json({ error: 'Error al cancelar la cita' }, { status: 500 })
    }
}
