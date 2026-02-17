
'use server'

import { db } from '@/lib/db'
import { hashPassword, comparePassword, signToken, generateVerificationToken, verifyToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { parse, setHours, setMinutes, setSeconds, setMilliseconds, startOfDay, addMinutes, format } from 'date-fns'
import { deleteEvent } from '@/lib/google'
import { revalidatePath } from 'next/cache'

export type ActionState = {
    success: boolean;
    error: string | null;
    message: string | null;
};

export async function register(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password || !fullName) {
        return { error: 'Todos los campos son obligatorios', success: false, message: null }
    }

    // Check existing user
    const result = await db.execute({
        sql: 'SELECT id, email_verified FROM users WHERE email = ?',
        args: [email]
    })

    if (result.rows.length > 0) {
        const existingUser = result.rows[0];
        if (existingUser.email_verified) {
            return { error: 'El usuario ya existe', success: false, message: null };
        }
        // If exists but not verified, delete it so we can re-register clean
        await db.execute({
            sql: 'DELETE FROM users WHERE id = ?',
            args: [existingUser.id]
        });
    }

    const hashedPassword = await hashPassword(password)
    const verificationToken = generateVerificationToken()

    let newUserId: any;

    try {
        const insertResult = await db.execute({
            sql: 'INSERT INTO users (email, password_hash, verification_token, full_name) VALUES (?, ?, ?, ?) RETURNING id',
            args: [email, hashedPassword, verificationToken, fullName]
        })
        newUserId = insertResult.rows[0].id;

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationToken);

        if (!emailResult.success) {
            // Rollback user creation
            await db.execute({
                sql: 'DELETE FROM users WHERE id = ?',
                args: [newUserId]
            });

            // Extract error message
            const errorMessage = emailResult.error && typeof emailResult.error === 'object' && 'message' in emailResult.error
                ? (emailResult.error as any).message
                : 'Error al enviar email de verificación';

            return { error: errorMessage, success: false, message: null };
        }

        return { success: true, message: 'Revisa tu email (incluso SPAM) para verificar la cuenta.', error: null }
    } catch (error) {
        console.error('Registration error:', error)
        return { error: 'Error al crear la cuenta', success: false, message: null }
    }
}

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await db.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [email]
    })

    const user = result.rows[0]

    if (!user || !await comparePassword(password, user.password_hash as string)) {
        return { error: 'Credenciales inválidas', success: false, message: null }
    }

    // Allow admin to bypass email verification
    if (!user.email_verified && user.role !== 'admin') {
        return { error: 'Por favor, verifica tu email primero', success: false, message: null }
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    const isAdmin = user.role === 'admin'
    if (isAdmin) {
        redirect('/admin')
    } else {
        redirect('/dashboard')
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}


export async function bookAppointment(formData: FormData): Promise<ActionState> {
    const customerName = formData.get('customer_name') as string;
    const customerEmail = formData.get('customer_email') as string;
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;
    const staffIdRaw = formData.get('staff_id') as string;
    const services = formData.get('services') as string;
    const notes = formData.get('notes') as string;

    if (!customerEmail || !customerName || !dateStr || !timeStr) {
        return { success: false, error: 'Por favor, rellena todos los datos obligatorios.', message: null };
    }

    const baseDate = startOfDay(parse(dateStr, 'yyyy-MM-dd', new Date()));
    const [hours, minutes] = timeStr.split(':').map(Number);
    const startTime = setMilliseconds(setSeconds(setMinutes(setHours(baseDate, hours), minutes), 0), 0);
    const endTime = addMinutes(startTime, 30);

    let staffId = staffIdRaw ? parseInt(staffIdRaw) : null;

    try {
        // Handle "Cualquiera" (Any) assignment
        // First, check if the selected staff is "Cualquiera"
        const staffResult = await db.execute({
            sql: 'SELECT id, name FROM staff WHERE id = ?',
            args: [staffId]
        });

        const isAnyStaff = !staffId || (staffResult.rows[0]?.name as string)?.toLowerCase() === 'cualquiera';

        if (isAnyStaff) {
            // Find a real staff member who is free at this time
            const realStaffResult = await db.execute("SELECT id, name FROM staff WHERE LOWER(name) != 'cualquiera'");
            const realStaffIds = realStaffResult.rows.map(r => r.id as number);

            let assignedStaffId = null;
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

            for (const sId of realStaffIds) {
                const conflict = await db.execute({
                    sql: `
                        SELECT id FROM appointments 
                        WHERE staff_id = ? 
                        AND start_time < ? 
                        AND end_time > ? 
                        AND (status = 'confirmed' OR (status = 'pending' AND created_at > ?))
                    `,
                    args: [
                        sId,
                        format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
                        format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
                        tenMinutesAgo
                    ]
                });
                if (conflict.rows.length === 0) {
                    assignedStaffId = sId;
                    break;
                }
            }

            if (!assignedStaffId) {
                return { success: false, error: 'No hay barberos disponibles a esta hora.', message: null };
            }
            staffId = assignedStaffId;
        } else {
            // Check if specifically selected staff is free
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
            const conflict = await db.execute({
                sql: `
                    SELECT id FROM appointments 
                    WHERE staff_id = ? 
                    AND start_time < ? 
                    AND end_time > ? 
                    AND (status = 'confirmed' OR (status = 'pending' AND created_at > ?))
                `,
                args: [
                    staffId,
                    format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
                    format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
                    tenMinutesAgo
                ]
            });
            if (conflict.rows.length > 0) {
                return { success: false, error: 'Este profesional ya tiene una cita reservada a esta hora.', message: null };
            }
        }

        const confirmationToken = generateVerificationToken();
        const now = new Date().toISOString();

        await db.execute({
            sql: 'INSERT INTO appointments (customer_name, customer_email, staff_id, start_time, end_time, status, services, notes, confirmation_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            args: [
                customerName,
                customerEmail,
                staffId,
                format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
                format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
                'pending',
                services,
                notes,
                confirmationToken,
                now
            ]
        });

        const emailResult = await sendBookingConfirmationEmail(customerEmail, {
            start_time: startTime,
            services: services,
            staffName: staffResult.rows[0]?.name
        }, confirmationToken);

        if (!emailResult.success) {
            console.error('Email send failure:', emailResult.error);
        }

        return {
            success: true,
            message: '¡Casi listo! Revisa tu correo para confirmar. Tienes 10 MINUTOS para confirmar o el hueco volverá a quedar libre.',
            error: null
        };
    } catch (error) {
        console.error('Booking error:', error);
        return { success: false, error: 'Error al procesar la reserva. Inténtalo de nuevo.', message: null };
    }
}

export async function cancelAppointment(appointmentId: number) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) redirect('/login');

    const payload = await verifyToken(sessionToken);
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
        redirect('/login');
    }

    const userId = payload.userId as number;
    const isAdmin = payload.role === 'admin' || payload.email === 'peluqueriapablo.contact@gmail.com' || payload.email === 'knowme';

    try {
        // Find appointment
        const result = await db.execute({
            sql: 'SELECT id, user_id, google_event_id FROM appointments WHERE id = ?',
            args: [appointmentId]
        });

        if (result.rows.length === 0) return { error: 'Cita no encontrada' };

        const appointment = result.rows[0];

        // Ensure it's the user's appointment OR admin
        if (appointment.user_id !== userId && !isAdmin) {
            return { error: 'No tienes permiso para cancelar esta cita' };
        }

        // 1. Delete from Google Calendar if exists
        if (appointment.google_event_id) {
            await deleteEvent(appointment.google_event_id as string);
        }

        // 2. Delete from DB
        await db.execute({
            sql: 'DELETE FROM appointments WHERE id = ?',
            args: [appointmentId]
        });

        revalidatePath('/dashboard');
        revalidatePath('/admin');

        return { success: true };
    } catch (error) {
        console.error('Cancel action error:', error);
        return { error: 'Error al cancelar la cita' };
    }
}

export async function requestPasswordReset(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get('email') as string;
    if (!email) return { error: 'El email es obligatorio', success: false, message: '' };

    const result = await db.execute({
        sql: 'SELECT id FROM users WHERE email = ?',
        args: [email]
    });

    if (result.rows.length === 0) {
        return { success: true, message: 'Si el correo existe, recibirás un link de recuperación.', error: '' };
    }

    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.execute({
        sql: 'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
        args: [token, expires.toISOString(), email]
    });

    await sendPasswordResetEmail(email, token);

    return { success: true, message: 'Si el correo existe, recibirás un link de recuperación.', error: '' };
}

export async function resetPassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    if (!token || !password) return { error: 'Faltan datos', success: false, message: null };

    const result = await db.execute({
        sql: 'SELECT id, reset_expires FROM users WHERE reset_token = ?',
        args: [token]
    });

    if (result.rows.length === 0) {
        return { error: 'Token inválido o expirado', success: false, message: null };
    }

    const user = result.rows[0];
    const expires = new Date(user.reset_expires as string);

    if (expires < new Date()) {
        return { error: 'El link ha expirado', success: false, message: null };
    }

    const hashedPassword = await hashPassword(password);

    await db.execute({
        sql: 'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
        args: [hashedPassword, user.id]
    });

    return { success: true, error: null, message: 'Contraseña actualizada' };
}

import { sendPasswordResetEmail } from '@/lib/email'


export async function createService(formData: FormData) {
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const duration = formData.get('duration') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const popular = formData.get('popular') === 'true' ? 1 : 0;

    await db.execute({
        sql: 'INSERT INTO services (name, price, duration, category, description, popular) VALUES (?, ?, ?, ?, ?, ?)',
        args: [name, price, duration, category, description, popular]
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function updateService(id: number, formData: FormData) {
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const duration = formData.get('duration') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const popular = formData.get('popular') === 'true' ? 1 : 0;

    await db.execute({
        sql: 'UPDATE services SET name = ?, price = ?, duration = ?, category = ?, description = ?, popular = ? WHERE id = ?',
        args: [name, price, duration, category, description, popular, id]
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function deleteService(id: number) {
    await db.execute({
        sql: 'DELETE FROM services WHERE id = ?',
        args: [id]
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function createStaff(formData: FormData) {
    const name = formData.get('name') as string;
    const avatar_url = formData.get('avatar_url') as string;

    await db.execute({
        sql: 'INSERT INTO staff (name, avatar_url) VALUES (?, ?)',
        args: [name, avatar_url]
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function deleteStaff(id: number) {
    await db.execute({
        sql: 'DELETE FROM staff WHERE id = ?',
        args: [id]
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function updateLocation(id: number, formData: FormData) {
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const schedule = formData.get('schedule') as string;


    await db.execute({
        sql: 'UPDATE locations SET name = ?, address = ?, phone = ?, schedule = ? WHERE id = ?',
        args: [name, address, phone, schedule, id]
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function updateSettings(formData: FormData) {
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
        if (typeof value === 'string') {

            await db.execute({
                sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
                args: [key, value]
            });
        }
    }
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function addPortfolioImage(formData: FormData) {
    const image_url = formData.get('image_url') as string;
    const tag = formData.get('tag') as string;

    await db.execute({
        sql: 'INSERT INTO portfolio_images (image_url, tag) VALUES (?, ?)',
        args: [image_url, tag]
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function deletePortfolioImage(id: number) {
    await db.execute({
        sql: 'DELETE FROM portfolio_images WHERE id = ?',
        args: [id]
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}
