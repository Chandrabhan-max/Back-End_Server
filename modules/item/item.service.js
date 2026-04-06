const db = require('../../db');

// fetch
exports.getItems = async () => {
  try {
    const result = await db.query(
      `SELECT id, item_code, name, selling_price, is_active
       FROM items
       ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (err) {
    console.error('service getItems:', err.message);
    throw err;
  }
};

// add
exports.addItem = async (data) => {
  const { item_code, name, selling_price, is_active } = data;
  
  if (!item_code || !name || selling_price === undefined) {
    throw new Error('VALIDATION_ERROR');
  }

  try {
    // check
    const check = await db.query('SELECT id FROM items WHERE item_code = $1', [item_code]);
    if (check.rows.length > 0) throw new Error('DUPLICATE_ITEM');

    // save
    const result = await db.query(
      `INSERT INTO items (item_code, name, selling_price, is_active) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [item_code, name, selling_price, is_active !== false]
    );
    return result.rows[0];
  } catch (err) {
    console.error("DB Error Add Item:", err.message);
    throw err;
  }
};

// edit
exports.updateItem = async (id, data) => {
  const { name, selling_price, is_active } = data;
  try {
    const result = await db.query(
      `UPDATE items 
       SET name = $1, selling_price = $2, is_active = $3 
       WHERE id = $4 RETURNING *`,
      [name, selling_price, is_active, id]
    );
    return result.rows[0];
  } catch (err) {
    console.error("DB Error Update Item:", err.message);
    throw err;
  }
};