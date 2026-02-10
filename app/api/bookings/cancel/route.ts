
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/?message=Invalid token', request.url));
    }

    try {
        // Find appointment with this token
        const result = await db.execute({
            sql: 'SELECT id, status FROM appointments WHERE confirmation_token = ?',
            args: [token]
        });

        if (result.rows.length === 0) {
            return new Response(`
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
                        <style>
                            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb; text-align: center; }
                            .card { background: white; padding: 40px; border-radius: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 400px; }
                            h1 { font-weight: 900; color: #6b7280; margin-bottom: 16px; letter-spacing: -0.05em; }
                            p { color: #9ca3af; line-height: 1.6; }
                            a { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #111; color: white; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 11px; text-transform: uppercase; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h1>Enlace Caducado</h1>
                            <p>Esta cita ya ha sido confirmada o el enlace no es válido.</p>
                            <a href="/">Volver a la Web</a>
                        </div>
                    </body>
                </html>
            `, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }

        const appointment = result.rows[0];

        // Deleting the appointment if it was pending
        if (appointment.status === 'pending') {
            await db.execute({
                sql: 'DELETE FROM appointments WHERE id = ?',
                args: [appointment.id]
            });
        }

        return new Response(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
                    <style>
                        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb; text-align: center; }
                        .card { background: white; padding: 40px; border-radius: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 400px; }
                        h1 { font-weight: 900; color: #ef4444; margin-bottom: 16px; letter-spacing: -0.05em; }
                        p { color: #6b7280; line-height: 1.6; }
                        a { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #111; color: white; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 11px; text-transform: uppercase; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Cita Cancelada</h1>
                        <p>Tu solicitud ha sido descartada correctamente. El hueco volverá a estar disponible para otros clientes.</p>
                        <a href="/">Volver a la Web</a>
                    </div>
                </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });

    } catch (error) {
        console.error('Error cancelling booking:', error);
        return NextResponse.redirect(new URL('/?error=Cancel failed', request.url));
    }
}
