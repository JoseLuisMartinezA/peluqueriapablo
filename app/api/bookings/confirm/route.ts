
import { db } from '@/lib/db';
import { createEvent } from '@/lib/google';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return new Response('Invalid token', { status: 400 });
    }



    // Find appointment with staff info
    const result = await db.execute({
        sql: `
      SELECT a.*, s.name as staff_name
      FROM appointments a
      LEFT JOIN staff s ON a.staff_id = s.id
      WHERE a.confirmation_token = ?
    `,
        args: [token],
    });

    if (result.rows.length === 0) {
        return new Response('Token invalid or expired', { status: 400 });
    }

    const appointment = result.rows[0];
    const email = (appointment.customer_email || 'Cliente') as string;
    const staffName = (appointment.staff_name || 'Sin asignar') as string;


    if (appointment.status === 'confirmed') {
        return redirect('/?already_confirmed=true');
    }

    // Create Google Calendar Event
    try {

        const event = await createEvent({
            summary: `Cita: ${appointment.customer_name || 'Nuevo Cliente'} - ${staffName}`,
            description: `Cita reservada desde la web.\nCliente: ${appointment.customer_name}\nEmail: ${email}\nBarbero: ${staffName}\nServicios: ${appointment.services}\nNotas: ${appointment.notes}`,
            start: {
                dateTime: appointment.start_time,
                timeZone: 'Europe/Madrid',
            },
            end: {
                dateTime: appointment.end_time,
                timeZone: 'Europe/Madrid',
            },
        });

        // Update DB
        await db.execute({
            sql: 'UPDATE appointments SET status = ?, google_event_id = ?, confirmation_token = NULL WHERE id = ?',
            args: ['confirmed', event.id || null, appointment.id]
        });

    } catch (error) {
        console.error('Error confirming booking:', error);
        return new Response('Failed to confirm booking with provider', { status: 500 });
    }

    return redirect('/?confirmed=true');
}
