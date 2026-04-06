const express = require('express');
const router = express.Router();
const controller = require('../modules/item/item.controller');

// get all items
router.get('/', controller.getAllItems);

// create item
router.post('/add', controller.createItem);

// update
router.put('/update/:id', controller.updateItem);

module.exports = router;