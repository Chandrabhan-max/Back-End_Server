const XLSX = require('xlsx');
const db = require('../../db');
const fs = require('fs-extra');

exports.processExcel = async (filePath) => {
  // read
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
   const rows = XLSX.utils.sheet_to_json(sheet);

  let grouped = {}; let errors = [];

  // group
  rows.forEach((row, index) => {
    if (!row.customer_id || !row.item_id || !row.quantity) {
      errors.push({ row: index + 2, error: 'missing required fields' }); return;
    }
    if (!grouped[row.customer_id]) grouped[row.customer_id] = [];
    grouped[row.customer_id].push({ item_id: row.item_id, quantity: row.quantity });
  });

  let preview = [];
  
  // process
  for (let customer_id in grouped) {
    // customer
    const cust = await db.query('SELECT id, gst FROM customers WHERE cust_id = $1 AND is_active = true', [customer_id]);
    if (cust.rows.length === 0) { errors.push({ customer_id, error: 'customer not found' }); continue; }

    let items = []; let total = 0;
    
    // items
    for (let item of grouped[customer_id]) {
      const itemRes = await db.query('SELECT id, selling_price FROM items WHERE item_code = $1 AND is_active = true', [item.item_id]);
      if (itemRes.rows.length === 0) { errors.push({ customer_id, item_id: item.item_id, error: 'item not found' }); continue; }

      const db_item_id = itemRes.rows[0].id;
      const price = itemRes.rows[0].selling_price;
      total += price * item.quantity;
      items.push({ item_id: db_item_id, quantity: item.quantity, price });
    }

    // gst
    let gstApplied = false;
    if (!cust.rows[0].gst) { total = total * 1.18; gstApplied = true; }

    preview.push({ customer_id: cust.rows[0].id, display_id: customer_id, total, gstApplied, items });
  }

  // cleanup
  await fs.remove(filePath);
  return { summary: { totalRows: rows.length, validInvoices: preview.length, errorCount: errors.length }, preview, errors };
};