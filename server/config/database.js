const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const fs      = require('fs');

// SQLite database file lives in the project root — persists between restarts
const dbPath = path.join(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }

    console.log('✅ Connected to SQLite database.');

    // Read schema — contains CREATE TABLE IF NOT EXISTS and a trigger
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaRaw  = fs.readFileSync(schemaPath, 'utf8');

    // Separate the ALTER TABLE migration from the rest of the schema.
    // db.exec handles multi-statement SQL including BEGIN...END trigger blocks,
    // but ALTER TABLE is run individually so its "duplicate column" error can
    // be silently ignored without aborting the rest of the setup.
    const alterLine = 'ALTER TABLE customers ADD COLUMN company TEXT';
    const schemaCoreRaw = schemaRaw.replace(alterLine + ';', '').replace(alterLine, '');

    // Step 1: Run core schema (safe to re-run — all use IF NOT EXISTS)
    db.exec(schemaCoreRaw, (schemaErr) => {
        if (schemaErr) {
            console.error('❌ Schema error:', schemaErr.message);
            return;
        }

        // Step 2: Non-destructive column migration — add 'company' if absent
        db.run(alterLine, (alterErr) => {
            if (alterErr && !alterErr.message.includes('duplicate column')) {
                console.error('❌ Migration error:', alterErr.message);
                return;
            }
            console.log('✅ Schema ready.');

            // Step 3: Conditional seeding — only when both tables are empty
            db.get(
                'SELECT (SELECT COUNT(*) FROM customers) AS c, (SELECT COUNT(*) FROM tickets) AS t',
                (countErr, row) => {
                    if (countErr) {
                        console.warn('⚠️  Could not check row counts:', countErr.message);
                        return;
                    }

                    if (row.c === 0 && row.t === 0) {
                        const seed = fs.readFileSync(
                            path.join(__dirname, '../../database/seed.sql'), 'utf8'
                        );
                        db.exec(seed, (seedErr) => {
                            if (seedErr) {
                                console.error('❌ Seed error:', seedErr.message);
                            } else {
                                console.log('✅ Sample data inserted (first-time setup).');
                            }
                        });
                    } else {
                        console.log(
                            `✅ Database has ${row.c} customer(s) and ${row.t} ticket(s) — skipping seed.`
                        );
                    }
                }
            );
        });
    });
});

// Enable foreign key enforcement for every connection
db.run('PRAGMA foreign_keys = ON');

module.exports = db;