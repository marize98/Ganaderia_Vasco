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
        role TEXT DEFAULT 'baserritarra',
        explotacion_id TEXT
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
            
            // Seed animals
            const animals = [
                ['ES481234567890', 'ES481230009876', 'Bovino', 'Vila', null, 'Excelente'],
                ['ES481234567891', 'ES481230009876', 'Bovino', 'Vila', null, 'Bien'],
                ['ES481234567892', 'ES481230009876', 'Bovino', 'Vila', null, 'Regular']
            ];
            animals.forEach(a => {
                db.run("INSERT INTO animals (id, explotacion_id, tipo, estado, madre_id, sanidad) VALUES (?, ?, ?, ?, ?, ?)", a);
            });
        }
    });
});

module.exports = db;
