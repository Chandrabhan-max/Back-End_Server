const db = require('../../db');

// fetch
exports.getCustomers = async () => {
  try {
    const result = await db.query(
      `SELECT id, cust_id, name, address, pan, gst, is_active
       FROM customers
       ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (err) {
    console.error('service getCustomers:', err.message);
    throw err;
  }
};

// add
exports.addCustomer = async (data) => {
  const { cust_id, name, address, pan, gst } = data;

  if (!cust_id || !name) {
    throw new Error('VALIDATION_ERROR');
  }

  try {
    // check
    const check = await db.query(
      'SELECT id FROM customers WHERE cust_id = $1',
      [cust_id]
    );

    if (check.rows.length > 0) {
      throw new Error('DUPLICATE_CUSTOMER');
    }

    // save
    const result = await db.query(
      `INSERT INTO customers 
       (cust_id, name, address, pan, gst) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, cust_id, name`,
      [cust_id, name, address, pan, gst]
    );

    return result.rows[0];

  } catch (err) {
    console.error('service addCustomer:', err.message);
    throw err;
  }
};

// update
exports.updateCustomer = async (id, data) => {
  const { name, address, pan, gst, is_active } = data;
  try {
    const result = await db.query(
      `UPDATE customers 
       SET name = $1, address = $2, pan = $3, gst = $4, is_active = $5 
       WHERE id = $6 RETURNING *`,
      [name, address, pan, gst, is_active, id]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};