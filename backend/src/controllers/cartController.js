const db = require('../db/db');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId; 

    const result = await db.query(
      `
      SELECT 
        ci.id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        c.name AS category
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = $1
      ORDER BY ci.id DESC
      `,
      [userId]
    );

    return res.json({
      status: 'ok',
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ getCart error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cart',
    });
  }
};


exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'productId and positive quantity are required',
      });
    }


    const productResult = await db.query(
      'SELECT id, stock FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }


    const existing = await db.query(
      `
      SELECT id, quantity 
      FROM cart_items 
      WHERE user_id = $1 AND product_id = $2
      `,
      [userId, productId]
    );

    let result;

    if (existing.rowCount > 0) {

      const cartItemId = existing.rows[0].id;

      result = await db.query(
        `
        UPDATE cart_items
        SET quantity = quantity + $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [quantity, cartItemId]
      );
    } else {
      result = await db.query(
        `
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [userId, productId, quantity]
      );
    }

    return res.status(201).json({
      status: 'ok',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ addToCart error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add to cart',
    });
  }
};


exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity == null) {
      return res.status(400).json({
        status: 'error',
        message: 'quantity is required',
      });
    }

    if (quantity <= 0) {
      const del = await db.query(
        `
        DELETE FROM cart_items 
        WHERE id = $1 AND user_id = $2
        RETURNING *
        `,
        [itemId, userId]
      );

      if (del.rowCount === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Cart item not found',
        });
      }

      return res.json({
        status: 'ok',
        message: 'Cart item removed',
      });
    }

    const result = await db.query(
      `
      UPDATE cart_items
      SET quantity = $1,
          updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
      `,
      [quantity, itemId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found',
      });
    }

    return res.json({
      status: 'ok',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ updateCartItem error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update cart item',
    });
  }
};


exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const result = await db.query(
      `
      DELETE FROM cart_items
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [itemId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found',
      });
    }

    return res.json({
      status: 'ok',
      message: 'Cart item removed',
    });
  } catch (error) {
    console.error('❌ removeCartItem error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to remove cart item',
    });
  }
};


exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    await db.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );

    return res.json({
      status: 'ok',
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('❌ clearCart error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to clear cart',
    });
  }
};
