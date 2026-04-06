const db = require('../../db');

// id
async function generateInvoiceId(client) {
  let id;
  let exists = true;
  while (exists) {
    const num = Math.floor(100000 + Math.random() * 900000);
    id = 'INVC' + num;
    const check = await client.query('SELECT id FROM invoices WHERE invoice_id = $1', [id]);
    exists = check.rows.length > 0;
  }
  return id;
}

// create
exports.createInvoice = async (data) => {
  const { customer_id, items } = data;

  if (!customer_id || !items || items.length === 0) throw new Error('VALIDATION_ERROR');
  if (!Array.isArray(items)) throw new Error('VALIDATION_ERROR');

  for (let item of items) {
    if (!item.item_id || !item.quantity || item.quantity <= 0) throw new Error('VALIDATION_ERROR');
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // customer
    const custRes = await client.query('SELECT * FROM customers WHERE id = $1', [customer_id]);
    if (custRes.rows.length === 0) throw new Error('CUSTOMER_NOT_FOUND');
    if (custRes.rows[0].is_active === false) throw new Error('CUSTOMER_INACTIVE');
    
    const customer = custRes.rows[0];
    let total = 0;

    // items
    for (let i = 0; i < items.length; i++) {
      const { item_id, quantity } = items[i];
      const itemRes = await client.query('SELECT * FROM items WHERE id = $1', [item_id]);
      
      if (itemRes.rows.length === 0) throw new Error('ITEM_NOT_FOUND');
      if (itemRes.rows[0].is_active === false) throw new Error(`ITEM_INACTIVE: ${itemRes.rows[0].name}`);

      total += itemRes.rows[0].selling_price * quantity;
    }

    // gst
    let gstApplied = false;
    if (!customer.gst) {
      total = total * 1.18;
      gstApplied = true;
    }

    const invoiceId = await generateInvoiceId(client);

    // save
    const invoiceRes = await client.query(
      `INSERT INTO invoices (invoice_id, customer_id, total_amount, gst_applied)
       VALUES ($1,$2,$3,$4) RETURNING id, invoice_id`,
      [invoiceId, customer_id, total, gstApplied]
    );

    const invoiceDbId = invoiceRes.rows[0].id;

    for (let i = 0; i < items.length; i++) {
      const { item_id, quantity } = items[i];
      const itemRes = await client.query('SELECT selling_price FROM items WHERE id = $1', [item_id]);
      const price = itemRes.rows[0].selling_price;
      await client.query(
        `INSERT INTO invoice_items (invoice_id, item_id, quantity, price)
         VALUES ($1,$2,$3,$4)`,
        [invoiceDbId, item_id, quantity, price]
      );
    }

    await client.query('COMMIT');
    return { invoice_id: invoiceId };

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('service createInvoice:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

// fetch
exports.getInvoices = async () => {
  const result = await db.query(
    `SELECT i.invoice_id, i.total_amount, i.created_at, i.gst_applied, c.name AS customer_name
     FROM invoices i
     JOIN customers c ON i.customer_id = c.id
     ORDER BY i.created_at DESC`
  );
  return result.rows;
};

// single
exports.getInvoice = async (invoiceId) => {
  const invoice = await db.query(
    `SELECT i.invoice_id, i.total_amount, i.created_at, i.gst_applied, c.name, c.address, c.pan, c.gst
     FROM invoices i JOIN customers c ON i.customer_id = c.id
     WHERE LOWER(i.invoice_id) = LOWER($1)`,
    [invoiceId]
  );
  if (invoice.rows.length === 0) throw new Error('NOT_FOUND');

  const items = await db.query(
    `SELECT it.name, ii.quantity, ii.price
     FROM invoice_items ii JOIN items it ON ii.item_id = it.id
     WHERE ii.invoice_id = (SELECT id FROM invoices WHERE LOWER(invoice_id) = LOWER($1))`,
    [invoiceId]
  );
  return { invoice: invoice.rows[0], items: items.rows };
};