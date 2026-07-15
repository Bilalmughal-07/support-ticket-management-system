const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const ticketsRoutes = require('./routes/tickets');
const customersRoutes = require('./routes/customers');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use('/api/tickets', ticketsRoutes);
app.use('/api/customers', customersRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('🚀 Support Ticket Management System API is running.');
});

// Global error handler (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is listening on http://localhost:${PORT}`);
});