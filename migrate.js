const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'server', 'baserri.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        const columns = rows.map(r => r.name);
        console.log('Current columns:', columns);
        
        const required = ['role', 'full_name', 'email', 'phone'];
        required.forEach(col => {
            if (!columns.includes(col)) {
                console.log(`Adding missing column: ${col}`);
                db.run(`ALTER TABLE users ADD COLUMN ${col} TEXT`, (err) => {
                    if (err) console.error(`Error adding ${col}:`, err.message);
                });
            }
        });
        
        // Final verification
        setTimeout(() => {
            db.all("PRAGMA table_info(users)", (err, finalRows) => {
                console.log('Final columns:', finalRows.map(r => r.name));
                db.close();
            });
        }, 1000);
    });
});
