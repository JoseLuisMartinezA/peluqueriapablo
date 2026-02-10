
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';

// 1. Quitar comillas si existen
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.substring(1, privateKey.length - 1);
}

// 2. Convertir \n literales en saltos de línea reales
privateKey = privateKey.replace(/\\n/g, '\n');

// 3. Caso crítico: Si la clave no tiene saltos de línea pero tiene el encabezado,
// es posible que el .env haya eliminado los saltos. Google JWT requiere que el cuerpo
// esté correctamente formateado o al menos que el decoder de Node pueda leerlo.
if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('[Google Auth] Fixing multi-line key format...');
    const body = privateKey
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');
    const chunks = body.match(/.{1,64}/g);
    if (chunks) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
    }
}

const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: SCOPES
});

const calendar = google.calendar({ version: 'v3', auth });

/**
 * List events for a specific time range to check availability.
 */
export async function listEvents(timeMin: string, timeMax: string) {
    try {
        const response = await calendar.events.list({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return response.data.items || [];
    } catch (error: any) {
        console.error('Error fetching calendar events:', error.message || error);
        return [];
    }
}

/**
 * Create a new event on the calendar.
 */
export async function createEvent(resource: any) {
    try {
        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            requestBody: resource,
        });
        return response.data;
    } catch (error: any) {
        console.error('Detailed error creating calendar event:', error.response?.data || error.message || error);
        throw error;
    }
}

/**
 * Delete an event from the calendar.
 */
export async function deleteEvent(eventId: string) {
    try {
        await calendar.events.delete({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            eventId: eventId,
        });
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting calendar event:', error.message || error);
        // We don't throw to avoid breaking the DB flow if calendar fails
        return { success: false, error: error.message };
    }
}

