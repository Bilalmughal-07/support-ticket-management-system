const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');

// GET all tickets
router.get('/', ticketsController.getTickets);

// GET ticket by ID
router.get('/:id', ticketsController.getTicket);

// POST create ticket
router.post('/', ticketsController.createTicket);

// PUT update ticket
router.put('/:id', ticketsController.updateTicket);

// DELETE ticket
router.delete('/:id', ticketsController.deleteTicket);

// GET search tickets (?keyword=...)
router.get('/search', ticketsController.searchTickets);

// GET dashboard stats
router.get('/stats', ticketsController.getStats);

module.exports = router;