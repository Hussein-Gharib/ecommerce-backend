const db = require('../db/db');

const createOrder = async (req, res) => {
  const userId = req.user.userId;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Items are required and must be a non-empty array',
    });
  }

  try {
    const productIds = items.map((item) => item.productId);
    const productsResult = await db.query(
      `SELECT id, price FROM products WHERE id = ANY($1::int[])`,
      [productIds]
    );

    if (productsResult.rowCount !== items.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more products do not exist',
      });
    }

    const productMap = {};
    productsResult.rows.forEach((p) => {
      productMap[p.id] = p.price;
    });

    let totalPrice = 0;
    items.forEach((item) => {
      const price = productMap[item.productId];
      totalPrice += price * item.quantity;
    });

    await db.query('BEGIN');

    const orderResult = await db.query(
      `INSERT INTO orders (user_id, total_price)
       VALUES ($1, $2)
       RETURNING id, user_id, total_price, status, created_at`,
      [userId, totalPrice]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const unitPrice = productMap[item.productId];
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.quantity, unitPrice]
      );
    }

    await db.query('COMMIT');

    return res.status(201).json({
      status: 'ok',
      data: order,
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('❌ createOrder error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create order',
    });
  }
};

const getMyOrders = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(
      `SELECT 
        o.id,
        o.total_price,
        o.status,
        o.created_at,
        json_agg(
          json_build_object(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price
          )
        ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.id DESC`,
      [userId]
    );

    return res.json({
      status: 'ok',
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ getMyOrders error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders',
    });
  }
};

const getOrderById = async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid order ID',
    });
  }

  try {
    const result = await db.query(
      `SELECT 
        o.id,
        o.user_id,
        o.total_price,
        o.status,
        o.created_at,
        json_agg(
          json_build_object(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price
          )
        ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    const order = result.rows[0];

    if (order.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not allowed to view this order',
      });
    }

    return res.json({
      status: 'ok',
      data: order,
    });
  } catch (error) {
    console.error('❌ getOrderById error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order',
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
