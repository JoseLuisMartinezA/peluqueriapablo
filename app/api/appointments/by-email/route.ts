import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
        return Response.json({ error: 'Email requerido' }, { status: 400 })
    }

    try {
        // Buscar citas por email del cliente con el nombre del barbero
        const result = await db.execute({
            sql: `
                SELECT 
                    a.id, 
                    a.customer_name, 
                    a.customer_email, 
                    a.staff_id, 
                    a.start_time, 
                    a.end_time, 
                    a.status, 
                    a.services, 
                    a.notes, 
                    a.created_at,
                    s.name as staff_name
                FROM appointments a
                LEFT JOIN staff s ON a.staff_id = s.id
                WHERE a.customer_email = ? AND a.status != 'cancelled'
                ORDER BY a.start_time DESC
            `,
            args: [email]
        })

        return Response.json({ appointments: result.rows })
    } catch (error) {
        console.error('Error fetching appointments:', error)
        return Response.json({ error: 'Error al buscar citas' }, { status: 500 })
    }
}
