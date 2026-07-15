const db = require('../config/database');

// Get all customers
const getAllCustomers = (callback) => {
    db.all('SELECT * FROM customers ORDER BY name', callback);
};

// Get customer by ID
const getCustomerById = (id, callback) => {
    db.get('SELECT * FROM customers WHERE id = ?', [id], callback);
};

// Create new customer
const createCustomer = (name, email, phone, company, callback) => {
    db.run(
        'INSERT INTO customers (name, email, phone, company) VALUES (?, ?, ?, ?)',
        [name, email, phone, company],
        function (err) {
            callback(err, this?.lastID);
        }
    );
};

// Update customer
const updateCustomer = (id, name, email, phone, company, callback) => {
    db.run(
        'UPDATE customers SET name = ?, email = ?, phone = ?, company = ? WHERE id = ?',
        [name, email, phone, company, id],
        function (err) {
            callback(err, this?.changes);
        }
    );
};

// Delete customer
const deleteCustomer = (id, callback) => {
    db.run('DELETE FROM customers WHERE id = ?', [id], function (err) {
        callback(err, this?.changes);
    });
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
};