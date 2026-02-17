
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    console.log("Migrating database...");

    try {
        // Add customer_name and customer_email to appointments
        await db.execute(`ALTER TABLE appointments ADD COLUMN customer_name TEXT;`);
        await db.execute(`ALTER TABLE appointments ADD COLUMN customer_email TEXT;`);

        // Make user_id optional (SQLite doesn't support changing NOT NULL directly easily without recreating table, 
        // but we can just stop passing it if it's not strictly enforced by a trigger or something. 
        // Wait, the original schema had user_id INTEGER NOT NULL.
        // In SQLite, to change NOT NULL you usually need to recreate the table.
        // Let's check if we can just recreate appointments table since it's dev.
    } catch (err) {
        console.log("Columns might already exist or error:", err.message);
    }

    console.log("Migration finished.");
}

main();
