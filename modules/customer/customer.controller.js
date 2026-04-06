const service = require('./customer.service');
const response = require('../../utils/response');

// fetch
exports.getAllCustomers = async (req, res) => {
  try {
    const data = await service.getCustomers();
    return response.success(res, data);
  } catch (err) {
    console.error(err.message);
    return response.error(res, 'failed to fetch customers');
  }
};

// add
exports.createCustomer = async (req, res) => {
  try {
    const result = await service.addCustomer(req.body);
    return response.success(res, result, 'customer created', 201);
  } catch (err) {
    console.error(err.message);
    // validation
    if (err.message === 'VALIDATION_ERROR') {
      return response.error(res, 'missing required fields', 400);
    }
    // exists
    if (err.message === 'DUPLICATE_CUSTOMER') {
      return response.error(res, 'customer already exists', 409);
    }
    return response.error(res, 'failed to create customer');
  }
};

// edit
exports.updateCustomer = async (req, res) => {
  try {
    const result = await service.updateCustomer(req.params.id, req.body);
    return response.success(res, result, 'customer updated');
  } catch (err) {
    console.error(err.message);
    return response.error(res, 'failed to update customer');
  }
};