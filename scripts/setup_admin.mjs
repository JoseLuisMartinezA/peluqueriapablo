
import { createClient } from '@libsql/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function createAdmin() {
    const email = 'peluqueriapablo.contact@gmail.com';
    const password = 'peluqueriapablo2026*1';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Check if exists
        const existing = await db.execute({
            sql: 'SELECT id FROM users WHERE email = ?',
            args: [email]
        });

        if (existing.rows.length > 0) {
            console.log('Admin already exists. Updating password...');
            await db.execute({
                sql: 'UPDATE users SET password_hash = ?, email_verified = 1 WHERE email = ?',
                args: [hashedPassword, email]
            });
        } else {
            console.log('Creating new admin...');
            await db.execute({
                sql: 'INSERT INTO users (email, password_hash, email_verified) VALUES (?, ?, ?)',
                args: [email, hashedPassword, 1]
            });
        }
        console.log('Admin user ready!');
    } catch (err) {
        console.error(err);
    }
}

createAdmin();
