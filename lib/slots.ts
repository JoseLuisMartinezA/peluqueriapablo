
import { addMinutes, areIntervalsOverlapping, format, getDay, isSameDay, parse, setHours, setMinutes, startOfDay, endOfDay } from 'date-fns';
import { listEvents } from './google';
import { db } from './db';

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 20; // 8 PM
const SLOT_DURATION_MINUTES = 30;
const TIMEZONE = 'Europe/Madrid'; // Spanish barbershop implied by name? Or local.

export async function getAvailableSlots(dateStr: string, staffId?: string | number) {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());

    // Basic working hours check (e.g. closed on Sundays)
    if (getDay(date) === 0) return []; // Closed on Sunday

    const dayStart = setMinutes(setHours(date, WORK_START_HOUR), 0);
    const dayEnd = setMinutes(setHours(date, WORK_END_HOUR), 0);

    // 1. Get Google Calendar Events (Global blocks)
    const timeMin = dayStart.toISOString();
    const timeMax = dayEnd.toISOString();
    const googleEvents = await listEvents(timeMin, timeMax);

    // 2. Get Turso Appointments
    const tursoResult = await db.execute({
        sql: `
        SELECT start_time, end_time, staff_id FROM appointments 
        WHERE status IN ('pending', 'confirmed')
        AND date(start_time) = ?
    `,
        args: [dateStr]
    });

    // 3. Get All Real Staff (needed if staffId is not specified or "all")
    const staffResult = await db.execute("SELECT id FROM staff WHERE name != 'Cualquiera'");
    const realStaffCount = staffResult.rows.length;

    // 4. Generate all possible slots
    const slots = [];
    let currentSlot = dayStart;

    while (currentSlot < dayEnd) {
        const slotEnd = addMinutes(currentSlot, SLOT_DURATION_MINUTES);

        // Check collision with Google Events (treat as blocking for everyone)
        const isBusyGoogle = googleEvents.some((event: any) => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);

            return areIntervalsOverlapping(
                { start: currentSlot, end: slotEnd },
                { start: eventStart, end: eventEnd }
            );
        });

        if (isBusyGoogle) {
            currentSlot = slotEnd;
            continue;
        }

        // Check collision with Turso Appointments
        if (staffId && staffId !== 'all' && staffId !== 'default') {
            // Check specific staff
            const isBusyTurso = tursoResult.rows.some(row => {
                const apptStart = new Date(row.start_time as string);
                const apptEnd = new Date(row.end_time as string);
                const apptStaffId = row.staff_id;

                return Number(apptStaffId) === Number(staffId) && areIntervalsOverlapping(
                    { start: currentSlot, end: slotEnd },
                    { start: apptStart, end: apptEnd }
                );
            });

            if (!isBusyTurso) {
                slots.push(format(currentSlot, 'HH:mm'));
            }
        } else {
            // Check if ANY staff is free
            // A slot is free if: (Total Staff Count) > (Staff booked at this time)
            const bookedStaffAtThisTime = new Set();
            tursoResult.rows.forEach(row => {
                const apptStart = new Date(row.start_time as string);
                const apptEnd = new Date(row.end_time as string);
                if (areIntervalsOverlapping(
                    { start: currentSlot, end: slotEnd },
                    { start: apptStart, end: apptEnd }
                )) {
                    bookedStaffAtThisTime.add(row.staff_id);
                }
            });

            if (bookedStaffAtThisTime.size < realStaffCount) {
                slots.push(format(currentSlot, 'HH:mm'));
            }
        }

        currentSlot = slotEnd;
    }

    return slots;
}
