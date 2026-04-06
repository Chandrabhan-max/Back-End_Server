const express = require('express');
const router = express.Router();

const controller = require('../modules/invoice/invoice.controller');

// create invoice
router.post('/create', controller.createInvoice);

// get all invoices
router.get('/', controller.getAllInvoices);

// get single invoice
router.get('/:id', controller.getInvoiceById);

module.exports = router;