
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import bcrypt from 'bcryptjs';

dotenv.config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("Resetting database...");

  try {
    // Drop existing tables
    await db.execute(`DROP TABLE IF EXISTS appointments;`);
    await db.execute(`DROP TABLE IF EXISTS users;`);
    await db.execute(`DROP TABLE IF EXISTS services;`);
    await db.execute(`DROP TABLE IF EXISTS staff;`);
    await db.execute(`DROP TABLE IF EXISTS locations;`);
    await db.execute(`DROP TABLE IF EXISTS settings;`);
    await db.execute(`DROP TABLE IF EXISTS portfolio_images;`);

    console.log("Dropped tables.");

    // Create Tables
    await db.execute(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        email_verified BOOLEAN DEFAULT 0,
        verification_token TEXT,
        reset_token TEXT,
        reset_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        duration TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        popular BOOLEAN DEFAULT 0,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        schedule TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT
      );
    `);

    await db.execute(`
      CREATE TABLE portfolio_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_url TEXT NOT NULL,
        tag TEXT
      );
    `);


    await db.execute(`
      CREATE TABLE appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, -- Optional for guest bookings
        customer_name TEXT,
        customer_email TEXT,
        staff_id INTEGER,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        status TEXT DEFAULT 'pending',
        services TEXT,
        notes TEXT,
        confirmation_token TEXT,
        google_event_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (staff_id) REFERENCES staff(id)
      );
    `);

    console.log("Created tables.");

    // Insert Admin
    const adminPassword = await bcrypt.hash('23052015*Jose1983', 10);
    await db.execute({
      sql: 'INSERT INTO users (email, password_hash, full_name, role, email_verified) VALUES (?, ?, ?, ?, ?)',
      args: ['barbershop', adminPassword, 'Admin Carlos', 'admin', 1]
    });
    console.log("Admin user created.");

    // Insert initial data
    const services = [
      ['Corte de Pelo', '15€', '30 min', 'Populares', 'Corte clásico o moderno con acabado a máquina.', 1, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200&auto=format&fit=crop'],
      ['Corte de Pelo + Barba', '22€', '45 min', 'Populares', 'Servicio completo de cabello y arreglo de barba.', 1, 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=200&auto=format&fit=crop'],
      ['Perfilado de Barba', '10€', '20 min', 'Populares', 'Delineado y rebajado de barba con navaja.', 1, 'https://images.unsplash.com/photo-1592647425447-1811e58e6e0d?q=80&w=200&auto=format&fit=crop'],
      ['Corte Premium (Lavado + Masaje)', '25€', '60 min', 'Otros', 'Experiencia relajante con lavado y masaje capilar.', 0, null],
      ['Tinte de Barba', '12€', '30 min', 'Otros', 'Coloración natural para cubrir canas o definir tono.', 0, null],
      ['Afeitado Clásico a Navaja', '18€', '40 min', 'Otros', 'Afeitado tradicional con toalla caliente.', 0, null]
    ];

    for (const s of services) {
      await db.execute({
        sql: 'INSERT INTO services (name, price, duration, category, description, popular, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: s
      });
    }

    const initialStaff = [
      ['Pablo', 'https://images.unsplash.com/photo-1542156822-6924d1a71ace?q=80&w=200&auto=format&fit=crop'],
      ['Santi', 'https://images.unsplash.com/photo-1599351431247-f57933842922?q=80&w=200&auto=format&fit=crop'],
      ['Cualquiera', 'https://plus.unsplash.com/premium_photo-1664533227389-44ad7b4e2079?q=80&w=200&auto=format&fit=crop']
    ];

    for (const st of initialStaff) {
      await db.execute({
        sql: 'INSERT INTO staff (name, avatar_url) VALUES (?, ?)',
        args: st
      });
    }

    await db.execute({
      sql: 'INSERT INTO locations (name, address, phone, schedule) VALUES (?, ?, ?, ?)',
      args: ['Barbershop Central', 'Calle Principal 123, Madrid', '+34 123 456 789', 'Lunes a Viernes: 10:00 - 20:00']
    });

    const settings = [
      ['hero_title', 'Barbershop'],
      ['hero_subtitle', 'Excelencia en cada corte'],
      ['hero_image', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop'],
      ['about_text', 'Una barbería con alma. Fusionamos las técnicas más clásicas con los estilos más vanguardistas para que luzcas tu mejor versión.'],

      ['instagram_url', 'https://instagram.com'],
      ['facebook_url', 'https://facebook.com'],
      ['google_maps_url', 'https://maps.google.com'],
      ['schedule_monday', '10:00 - 20:00'],
      ['schedule_tuesday', '10:00 - 20:00'],
      ['schedule_wednesday', '10:00 - 20:00'],
      ['schedule_thursday', '10:00 - 20:00'],
      ['schedule_friday', '10:00 - 20:00'],
      ['schedule_saturday', '09:00 - 15:00'],
      ['schedule_sunday', 'Cerrado'],
    ];

    for (const [key, value] of settings) {
      await db.execute({
        sql: 'INSERT INTO settings (key, value) VALUES (?, ?)',
        args: [key, value]
      });
    }

    const portfolio = [
      ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop', 'Corte'],
      ['https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop', 'Barba'],
      ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop', 'Local'],
      ['https://images.unsplash.com/photo-1592647425447-1811e58e6e0d?q=80&w=600&auto=format&fit=crop', 'Equipo'],
    ];

    for (const p of portfolio) {
      await db.execute({
        sql: 'INSERT INTO portfolio_images (image_url, tag) VALUES (?, ?)',
        args: p
      });
    }

    console.log("Initial data inserted.");

  } catch (err) {
    console.error("Error resetting database:", err);
    process.exit(1);
  }

  console.log("Database reset successfully.");
}

main();
