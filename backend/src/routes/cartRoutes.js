const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, cartController.getCart);


router.post('/', authMiddleware, cartController.addToCart);


router.put('/:itemId', authMiddleware, cartController.updateCartItem);


router.delete('/:itemId', authMiddleware, cartController.removeCartItem);


router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router;
