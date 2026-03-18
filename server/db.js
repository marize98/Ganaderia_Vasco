const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'baserri.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database', err.message);
    else console.log('[BASERRI-ADITU] Database connected and operational');
});

db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'Ganadero PRO',
        explotacion_id TEXT,
        full_name TEXT,
        email TEXT,
        phone TEXT
    )`);

    // Livestock table
    db.run(`CREATE TABLE IF NOT EXISTS animals (
        id TEXT PRIMARY KEY,
        explotacion_id TEXT,
        tipo TEXT,
        estado TEXT,
        madre_id TEXT,
        sanidad TEXT,
        ultima_mov TEXT
    )`);

    // Movements table
    db.run(`CREATE TABLE IF NOT EXISTS movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_id TEXT,
        origen TEXT,
        destino TEXT,
        fecha TEXT,
        guia_status TEXT
    )`);

    // Seed data if empty
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPass = bcrypt.hashSync('Yasmincita27**', 10);
            db.run("INSERT INTO users (username, password, explotacion_id) VALUES (?, ?, ?)", 
                ['marize98', hashedPass, 'ES481230009876']);
            
            // Seed movements/reports
            const movements = [
                ['ES481234567890', 'ES481230009876', 'Mercado Gernika', '2026-03-18', 'Firmado'],
                ['ES481234567891', 'ES481230009876', 'Matadero Bilbao', '2026-03-17', 'Pendiente'],
                ['ES481234567892', 'ES481230009876', 'Explotación Vecina', '2026-03-15', 'Firmado']
            ];
            movements.forEach(m => {
                db.run("INSERT INTO movements (animal_id, origen, destino, fecha, guia_status) VALUES (?, ?, ?, ?, ?)", m);
            });
        }
    });
});

module.exports = db;
