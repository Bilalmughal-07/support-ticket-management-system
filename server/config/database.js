const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// SQLite database file will be created in the project root
const dbPath = path.join(__dirname, '../../database.sqlite');

// Create or open the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database.');
        
        // Read and execute schema.sql
        const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
        const seed = fs.readFileSync(path.join(__dirname, '../../database/seed.sql'), 'utf8');

        db.exec(schema, (err) => {
            if (err) {
                console.error('❌ Schema error:', err.message);
            } else {
                console.log('✅ Schema created.');
                db.exec(seed, (err) => {
                    if (err) {
                        console.error('❌ Seed error:', err.message);
                    } else {
                        console.log('✅ Seed data inserted.');
                    }
                });
            }
        });
    }
});

module.exports = db;