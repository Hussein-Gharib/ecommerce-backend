const db = require('../db/db');


const getAllProducts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC`
    );

    res.json({
      status: 'ok',
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch products' });
  }
};


const getProductById = async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ status: 'error', message: 'Invalid product ID' });
  }

  try {
    const result = await db.query(
      `SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    res.json({ status: 'ok', data: result.rows[0] });
  } catch (error) {
    console.error('❌ Error fetching product:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch product' });
  }
};


const createProduct = async (req, res) => {
  const { name, description, price, stock, image_url, category_id } = req.body;

  if (!name || !price) {
    return res.status(400).json({ status: 'error', message: 'Name and price are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO products 
        (name, description, price, stock, image_url, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, price, stock, image_url, category_id]
    );

    res.status(201).json({ status: 'ok', data: result.rows[0] });
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to create product' });
  }
};


const updateProduct = async (req, res) => {
  const id = Number(req.params.id);
  const { name, description, price, stock, image_url, category_id } = req.body;

  try {
    const result = await db.query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, stock=$4, image_url=$5, category_id=$6
       WHERE id=$7
       RETURNING *`,
      [name, description, price, stock, image_url, category_id, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    res.json({ status: 'ok', data: result.rows[0] });
  } catch (error) {
    console.error('❌ Error updating product:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to update product' });
  }
};


const deleteProduct = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await db.query(
      `DELETE FROM products WHERE id=$1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    res.json({ status: 'ok', message: 'Product deleted' });
  } catch (error) {
    console.error('❌ Error deleting product:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete product' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
