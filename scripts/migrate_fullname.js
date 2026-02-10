
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
    try {
        console.log('Adding full_name column...');
        await db.execute('ALTER TABLE users ADD COLUMN full_name TEXT;');
        console.log('Success!');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('Column already exists.');
        } else {
            console.error('Error:', e.message);
        }
    }
    process.exit(0);
}

run();
