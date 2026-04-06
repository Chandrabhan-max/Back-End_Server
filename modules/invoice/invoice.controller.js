const service = require('./invoice.service');
const response = require('../../utils/response');

// create
exports.createInvoice = async (req, res) => {
    try {
        const result = await service.createInvoice(req.body);
        return response.success(res, result, 'invoice created', 201);

    } catch (err) {
        console.error(err.message);

        if (err.message === 'VALIDATION_ERROR') {
            return response.error(res, 'invalid input', 400);
        }

        if (err.message === 'CUSTOMER_NOT_FOUND') {
            return response.error(res, 'customer not found', 404);
        }

        if (err.message === 'ITEM_NOT_FOUND') {
            return response.error(res, 'item not found', 404);
        }

        return response.error(res, 'failed to create invoice');
    }
};


// get all
exports.getAllInvoices = async (req, res) => {
    try {
        const data = await service.getInvoices();
        return response.success(res, data);

    } catch (err) {
        console.error(err.message);
        return response.error(res, 'failed to fetch invoices');
    }
};


// get one
exports.getInvoiceById = async (req, res) => {
    try {
        const data = await service.getInvoice(req.params.id);
        return response.success(res, data);

    } catch (err) {
        console.error(err.message);
        return response.error(res, 'invoice not found', 404);
    }
};