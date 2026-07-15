const db = require('../config/database');

// Get all tickets with customer name
const getAllTickets = (callback) => {
    const sql = `
        SELECT tickets.*, customers.name AS customer_name 
        FROM tickets 
        JOIN customers ON tickets.customer_id = customers.id 
        ORDER BY tickets.created_at DESC
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
        function (err) {
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
        function (err) {
            callback(err, this?.changes);
        }
    );
};

// Delete ticket
const deleteTicket = (id, callback) => {
    db.run('DELETE FROM tickets WHERE id = ?', [id], function (err) {
        callback(err, this?.changes);
    });
};

// Search tickets by keyword — searches subject, customer name, customer email, and ticket ID
const searchTickets = (keyword, callback) => {
    const sql = `
        SELECT tickets.*, customers.name AS customer_name 
        FROM tickets 
        JOIN customers ON tickets.customer_id = customers.id 
        WHERE tickets.subject LIKE ?
           OR customers.name  LIKE ?
           OR customers.email LIKE ?
           OR CAST(tickets.id AS TEXT) = ?
        ORDER BY tickets.created_at DESC
    `;
    const pattern = `%${keyword}%`;
    // Exact match on ID (no wildcards) so "1" does not match ticket "10", "11", etc.
    db.all(sql, [pattern, pattern, pattern, keyword], callback);
};

// Filter tickets by status and/or priority
const filterTickets = (status, priority, callback) => {
    const conditions = [];
    const params = [];

    if (status) {
        conditions.push('tickets.status = ?');
        params.push(status);
    }
    if (priority) {
        conditions.push('tickets.priority = ?');
        params.push(priority);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
        SELECT tickets.*, customers.name AS customer_name 
        FROM tickets 
        JOIN customers ON tickets.customer_id = customers.id 
        ${where}
        ORDER BY tickets.created_at DESC
    `;
    db.all(sql, params, callback);
};

// Get dashboard statistics — keys match what dashboard.js expects
const getStats = (callback) => {
    const sql = `
        SELECT 
            COUNT(CASE WHEN status = 'Open'        THEN 1 END) AS open,
            COUNT(CASE WHEN status = 'In Progress' THEN 1 END) AS inProgress,
            COUNT(CASE WHEN status = 'Closed'      THEN 1 END) AS closed,
            COUNT(*)                                            AS total
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
    filterTickets,
    getStats
};