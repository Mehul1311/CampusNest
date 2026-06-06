const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/create', OrderController.createOrder);
router.post('/verify-payment', OrderController.verifyPayment);
router.get('/my', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderById);

module.exports = router;
