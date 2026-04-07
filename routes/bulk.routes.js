const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');

const controller = require('../modules/bulk/bulk.controller');

const upload = multer({ dest: os.tmpdir() }); 

router.post('/upload', upload.single('file'), controller.uploadFile);
router.post('/error-report', controller.downloadErrorReport);
router.post('/create', controller.createBulkInvoices);

module.exports = router;