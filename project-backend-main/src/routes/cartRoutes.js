const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/add', CartController.add);
router.get('/', CartController.get);
router.put('/:itemId/quantity', CartController.updateQuantity);
router.delete('/:itemId', CartController.remove);
router.delete('/', CartController.clear);

module.exports = router;
