
'use server'

import { db } from '@/lib/db'
import { hashPassword, comparePassword, signToken, generateVerificationToken, verifyToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { parse, setHours, setMinutes } from 'date-fns'
import { deleteEvent } from '@/lib/google'
import { revalidatePath } from 'next/cache'

export async function register(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password || !fullName) {
        return { error: 'Todos los campos son obligatorios' }
    }

    // Check existing user
    const result = await db.execute({
        sql: 'SELECT id, email_verified FROM users WHERE email = ?',
        args: [email]
    })

    if (result.rows.length > 0) {
        const existingUser = result.rows[0];
        if (existingUser.email_verified) {
            return { error: 'El usuario ya existe' };
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

            return { error: errorMessage };
        }

        return { success: true, message: 'Revisa tu email (incluso SPAM) para verificar la cuenta.' }
    } catch (error) {
        console.error('Registration error:', error)
        return { error: 'Error al crear la cuenta' }
    }
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await db.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [email]
    })

    const user = result.rows[0]

    if (!user || !await comparePassword(password, user.password_hash as string)) {
        return { error: 'Invalid credentials' }
    }

    if (!user.email_verified) {
        return { error: 'Please verify your email first' }
    }

    // Create session
    const token = await signToken({ userId: user.id, email: user.email })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
    })

    const isAdmin = user.email === 'peluqueriapablo.contact@gmail.com'
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

export async function bookAppointment(formData: FormData) {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) redirect('/login');

    const payload = await verifyToken(session.value);
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
        redirect('/login');
    }

    const userId = payload.userId as number;
    const email = payload.email as string;

    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;

    if (!dateStr || !timeStr) {
        throw new Error('Missing data');
    }

    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    const [hours, minutes] = timeStr.split(':').map(Number);
    const startTime = setMinutes(setHours(date, hours), minutes);
    const endTime = setMinutes(setHours(date, hours), minutes + 30);

    const confirmationToken = generateVerificationToken();

    try {
        await db.execute({
            sql: 'INSERT INTO appointments (user_id, start_time, end_time, status, confirmation_token) VALUES (?, ?, ?, ?, ?)',
            args: [userId, startTime.toISOString(), endTime.toISOString(), 'pending', confirmationToken]
        });

        await sendBookingConfirmationEmail(email, { start_time: startTime }, confirmationToken);

        redirect('/book/success');
    } catch (error) {
        console.error('Booking error:', error);
        throw error;
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
    const isAdmin = payload.email === 'peluqueriapablo.contact@gmail.com';

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

export async function requestPasswordReset(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) return { error: 'El email es obligatorio' };

    const result = await db.execute({
        sql: 'SELECT id FROM users WHERE email = ?',
        args: [email]
    });

    if (result.rows.length === 0) {
        return { success: true, message: 'Si el correo existe, recibirás un link de recuperación.' };
    }

    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.execute({
        sql: 'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
        args: [token, expires.toISOString(), email]
    });

    await sendPasswordResetEmail(email, token);

    return { success: true, message: 'Si el correo existe, recibirás un link de recuperación.' };
}

export async function resetPassword(prevState: any, formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    if (!token || !password) return { error: 'Faltan datos' };

    const result = await db.execute({
        sql: 'SELECT id, reset_expires FROM users WHERE reset_token = ?',
        args: [token]
    });

    if (result.rows.length === 0) {
        return { error: 'Token inválido o expirado' };
    }

    const user = result.rows[0];
    const expires = new Date(user.reset_expires as string);

    if (expires < new Date()) {
        return { error: 'El link ha expirado' };
    }

    const hashedPassword = await hashPassword(password);

    await db.execute({
        sql: 'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
        args: [hashedPassword, user.id]
    });

    return { success: true };
}

import { sendPasswordResetEmail } from '@/lib/email'

