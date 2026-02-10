
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const EMAIL_STYLE = `
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    background-color: #f9fafb;
    padding: 40px 20px;
`;

const CARD_STYLE = `
    max-width: 500px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #f3f4f6;
`;

const HEADER_STYLE = `
    background: linear-gradient(135deg, #C5A059 0%, #b58941 100%);
    padding: 32px;
    text-align: center;
`;

const CONTENT_STYLE = `
    padding: 40px 32px;
`;

const BUTTON_STYLE = `
    display: block;
    width: 100%;
    margin-top: 32px;
    padding: 16px;
    background: #111111;
    color: #ffffff;
    text-align: center;
    text-decoration: none;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 11px;
    border-radius: 12px;
`;

const SECONDARY_BUTTON_STYLE = `
    display: block;
    width: 100%;
    margin-top: 12px;
    padding: 16px;
    background: #fee2e2;
    color: #ef4444;
    text-align: center;
    text-decoration: none;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 11px;
    border-radius: 12px;
`;

export async function sendVerificationEmail(email: string, token: string) {
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

    try {
        const info = await transporter.sendMail({
            from: `"Pablo BarberShop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '¡Bienvenido! Activa tu cuenta - Pablo BarberShop',
            html: `
                <div style="${EMAIL_STYLE}">
                    <div style="${CARD_STYLE}">
                        <div style="${HEADER_STYLE}">
                            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: -0.05em; text-transform: uppercase;">PABLO BARBER</h1>
                        </div>
                        <div style="${CONTENT_STYLE}">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800;">Hola, ¡bienvenido!</h2>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">Estamos encantados de tenerte. Para empezar a reservar tus citas, solo necesitamos que confirmes tu correo electrónico pulsando el botón de abajo.</p>
                            <a href="${confirmLink}" style="${BUTTON_STYLE}">Activar mi cuenta</a>
                        </div>
                    </div>
                </div>
            `,
        });
        return { success: true };
    } catch (err) {
        console.error('Error sending email:', err);
        return { success: false, error: err };
    }
}

export async function sendBookingConfirmationEmail(email: string, bookingDetails: any, token: string) {
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/confirm?token=${token}`;
    const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/cancel?token=${token}`;
    const date = new Date(bookingDetails.start_time);

    try {
        const info = await transporter.sendMail({
            from: `"Pablo BarberShop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Confirma tu cita - Pablo BarberShop',
            html: `
                <div style="${EMAIL_STYLE}">
                    <div style="${CARD_STYLE}">
                        <div style="${HEADER_STYLE}">
                            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: -0.05em; text-transform: uppercase;">PABLO BARBER</h1>
                        </div>
                        <div style="${CONTENT_STYLE}">
                            <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800;">¡Casi está listo!</h2>
                            <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Has solicitado una cita. Por favor, confírmala para reservar tu hueco en la agenda.</p>
                            
                            <div style="background: #f9fafb; padding: 20px; border-radius: 16px; border: 1px solid #f3f4f6;">
                                <div style="font-size: 10px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Fecha y Hora</div>
                                <div style="font-size: 16px; font-weight: 800; color: #111111;">
                                    ${date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    <br/>
                                    ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}hs
                                </div>
                            </div>

                            <a href="${confirmLink}" style="${BUTTON_STYLE}">Confirmar Cita</a>
                            <a href="${cancelLink}" style="${SECONDARY_BUTTON_STYLE}">Cancelar Solicitud</a>
                        </div>
                    </div>
                </div>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending booking email:', error);
        return { success: false, error };
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password/reset?token=${token}`;

    try {
        await transporter.sendMail({
            from: `"Pablo BarberShop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Recupera tu contraseña - Pablo BarberShop',
            html: `
                <div style="${EMAIL_STYLE}">
                    <div style="${CARD_STYLE}">
                        <div style="${HEADER_STYLE}">
                            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: -0.05em; text-transform: uppercase;">PABLO BARBER</h1>
                        </div>
                        <div style="${CONTENT_STYLE}">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800;">¿Olvidaste tu contraseña?</h2>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">No pasa nada, nos sucede a todos. Pulsa el botón de abajo para elegir una nueva contraseña. Este enlace caducará en 1 hora.</p>
                            <a href="${resetLink}" style="${BUTTON_STYLE}">Restablecer Contraseña</a>
                            <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 11px; text-align: center;">Si no has solicitado esto, puedes ignorar este correo con total seguridad.</p>
                        </div>
                    </div>
                </div>
            `,
        });
        return { success: true };
    } catch (err) {
        console.error('Error sending reset email:', err);
        return { success: false, error: err };
    }
}

