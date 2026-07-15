const db = require('../config/database');

// Get all tickets with customer name
const getAllTickets = (callback) => {
    const sql = `
        SELECT tickets.*, customers.name AS customer_name 
        FROM tickets 
        JOIN customers ON tickets.customer_id = customers.id 
        ORDER BY tickets.id
    `;
    db.all(sql, callback);
};

// Get ticket by ID with customer name
const getTicketById = (id, callback) => {
    const sql = `
        SELECT tickets.*, customers.name AS customer_name 
        FROM tickets 
        JOIN customers ON tickets.customer_id = customers.id 
        WHERE tickets.id = ?
    `;
    db.get(sql, [id], callback);
};

// Create new ticket
const createTicket = (customer_id, subject, description, priority, status, callback) => {
    db.run(
        `INSERT INTO tickets (customer_id, subject, description, priority, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [customer_id, subject, description, priority, status],
        function(err) {
            callback(err, this?.lastID);
        }
    );
};

// Update ticket (automatically updates updated_at)
const updateTicket = (id, customer_id, subject, description, priority, status, callback) => {
    db.run(
        `UPDATE tickets 
         SET customer_id = ?, subject = ?, description = ?, priority = ?, status = ?, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [customer_id, subject, description, priority, status, id],
        function(err) {
            callback(err, this?.changes);
        }
    );
};

// Delete ticket
const deleteTicket = (id, callback) => {
    db.run('DELETE FROM tickets WHERE id = ?', [id], function(err) {
        callback(err, this?.changes);
    });
};

// Search tickets by keyword (subject or customer name)
const searchTickets = (keyword, callback) => {
    const sql = `
        SELECT tickets.*, customers.name AS customer_name 
        FROM tickets 
        JOIN customers ON tickets.customer_id = customers.id 
        WHERE tickets.subject LIKE ? OR customers.name LIKE ?
    `;
    const pattern = `%${keyword}%`;
    db.all(sql, [pattern, pattern], callback);
};

// Get dashboard statistics (counts by status)
const getStats = (callback) => {
    const sql = `
        SELECT 
            COUNT(CASE WHEN status = 'Open' THEN 1 END) AS open_count,
            COUNT(CASE WHEN status = 'In Progress' THEN 1 END) AS inprogress_count,
            COUNT(CASE WHEN status = 'Closed' THEN 1 END) AS closed_count,
            COUNT(*) AS total
        FROM tickets
    `;
    db.get(sql, callback);
};

module.exports = {
    getAllTickets,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    searchTickets,
    getStats
};