const express = require('express');
const router = express.Router();

const controller = require('../modules/customer/customer.controller');

router.get('/', controller.getAllCustomers);

router.post('/add', controller.createCustomer);
router.put('/update/:id', controller.updateCustomer);

module.exports = router;