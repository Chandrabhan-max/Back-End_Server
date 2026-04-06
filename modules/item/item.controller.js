const service = require('./item.service');
const response = require('../../utils/response');

// fetch
exports.getAllItems = async (req, res) => {
  try {
    const data = await service.getItems();
    return response.success(res, data);
  } catch (err) {
    console.error(err.message);
    return response.error(res, 'failed to fetch items');
  }
};

// add
exports.createItem = async (req, res) => {
  try {
    const result = await service.addItem(req.body);
    return response.success(res, result, 'item created', 201);
  } catch (err) {
    console.error(err.message);
    // validation
    if (err.message === 'VALIDATION_ERROR') return response.error(res, 'missing required fields', 400);
    // exists
    if (err.message === 'DUPLICATE_ITEM') return response.error(res, 'item already exists', 409);
    return response.error(res, 'failed to create item');
  }
};

// update
exports.updateItem = async (req, res) => {
  try {
    const result = await service.updateItem(req.params.id, req.body);
    return response.success(res, result, 'item updated');
  } catch (err) {
    console.error(err.message);
    return response.error(res, 'failed to update item');
  }
};