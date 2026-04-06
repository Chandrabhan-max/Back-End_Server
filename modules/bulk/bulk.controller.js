const service = require('./bulk.service');
const response = require('../../utils/response');
const XLSX = require('xlsx');
const fs = require('fs');

// upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) { return response.error(res, 'file missing', 400); }

    const result = await service.processExcel(req.file.path);
    return response.success(res, result, 'file processed');

  } catch (err) {
    console.error('uploadFile:', err.message);
    return response.error(res, 'failed to process file');
  }
};

// report
exports.downloadErrorReport = async (req, res) => {
  try {
    const { errors } = req.body;
    if (!errors || errors.length === 0) { return response.error(res, 'no errors found', 400); }

    const worksheet = XLSX.utils.json_to_sheet(errors);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');

    const filePath = 'error_report.xlsx';
    XLSX.writeFile(workbook, filePath);

    return res.download(filePath, () => { fs.unlinkSync(filePath); });

  } catch (err) {
    console.error('downloadErrorReport:', err.message);
    return response.error(res, 'error generating report');
  }
};

// create
exports.createBulkInvoices = async (req, res) => {
  try {
    const { preview } = req.body;
    if (!preview || preview.length === 0) { return response.error(res, 'no data to process', 400); }

    let results = [];

    for (let entry of preview) {
      try {
        const result = await require('../invoice/invoice.service')
          .createInvoice({
            customer_id: entry.customer_id,
            items: entry.items
          });

        results.push({
          customer_id: entry.customer_id,
          status: 'created',
          invoice_id: result.invoice_id
        });

      } catch (err) {
        results.push({
          customer_id: entry.customer_id,
          status: 'failed',
          error: err.message
        });
      }
    }

    return response.success(res, results, 'bulk processed');

  } catch (err) {
    console.error('createBulkInvoices:', err.message);
    return response.error(res, 'bulk create failed');
  }
};