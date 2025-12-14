const db = require('../db/db');

const getAllCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name FROM categories ORDER BY id ASC');
    res.json({ status: 'ok', count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch categories' });
  }
};

module.exports = { getAllCategories };
