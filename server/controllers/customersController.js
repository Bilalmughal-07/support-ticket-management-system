const Customer = require('../models/customerModel');

// Get all customers
const getCustomers = (req, res) => {
    Customer.getAllCustomers((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Get single customer by ID
const getCustomer = (req, res) => {
    const id = req.params.id;
    Customer.getCustomerById(id, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Customer not found' });
        res.json(row);
    });
};

// Create new customer
const createCustomer = (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'name and email are required' });
    }
    Customer.createCustomer(name, email, phone, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, message: 'Customer created' });
    });
};

// Update customer
const updateCustomer = (req, res) => {
    const id = req.params.id;
    const { name, email, phone } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'name and email are required' });
    }
    Customer.updateCustomer(id, name, email, phone, (err, changes) => {
        if (err) return res.status(500).json({ error: err.message });
        if (changes === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer updated' });
    });
};

// Delete customer
const deleteCustomer = (req, res) => {
    const id = req.params.id;
    Customer.deleteCustomer(id, (err, changes) => {
        if (err) return res.status(500).json({ error: err.message });
        if (changes === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer deleted' });
    });
};

module.exports = {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
};