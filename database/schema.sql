-- database/schema.sql
PRAGMA foreign_keys = ON;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    email   TEXT NOT NULL UNIQUE,
    phone   TEXT,
    company TEXT
);

-- Non-destructive migration: add 'company' column to existing databases.
-- SQLite does not support IF NOT EXISTS on ALTER TABLE, so we use a
-- CREATE TABLE trick: attempt the ALTER and silently ignore the error
-- if the column already exists (handled in database.js via db.exec).
-- The line below is run as a separate statement so schema.sql stays valid.
ALTER TABLE customers ADD COLUMN company TEXT;

-- Tickets table
-- Priority: Low | Medium | High | Critical
-- Status:   Open | In Progress | Closed
CREATE TABLE IF NOT EXISTS tickets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    subject     TEXT    NOT NULL,
    description TEXT,
    priority    TEXT    CHECK(priority IN ('Low','Medium','High','Critical')) DEFAULT 'Medium',
    status      TEXT    CHECK(status   IN ('Open','In Progress','Closed'))    DEFAULT 'Open',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Automatically keep updated_at current whenever a ticket row is modified
CREATE TRIGGER IF NOT EXISTS trg_tickets_updated_at
AFTER UPDATE ON tickets
FOR EACH ROW
BEGIN
    UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;