const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');
const ItemModel = require('../models/itemModel');
const PaymentService = require('../services/paymentService');
const config = require('../config');

const PLATFORM_FEE = config.platform?.feePercent ?? 0.25;

const OrderController = {
  async createOrder(req, res) {
    try {
      const cartItems = await CartModel.getByUserId(req.user.uid);
      if (!cartItems.length) {
        return res.status(400).json({ success: false, error: 'Cart is empty' });
      }

      const items = cartItems.map((c) => {
        const sellerPrice = parseFloat(c.price);
        const qty = c.quantity || 1;
        const sellerAmount = Math.round(sellerPrice * qty * 100) / 100;
        const platformFee = Math.round(sellerAmount * PLATFORM_FEE * 100) / 100;
        const buyerPaid = Math.round((sellerAmount + platformFee) * 100) / 100;
        return {
          itemId: c.item_id,
          title: c.title,
          quantity: qty,
          sellerId: c.seller_id,
          seller_amount: sellerAmount,
          platform_fee: platformFee,
          buyer_paid: buyerPaid,
        };
      });

      const totalAmount = items.reduce((s, i) => s + i.buyer_paid, 0);

      if (!config.razorpay.keyId || !config.razorpay.keySecret) {
        return res.status(503).json({
          success: false,
          error: 'Payment gateway not configured',
        });
      }

      const order = await OrderModel.create({
        userId: req.user.uid,
        items,
        totalAmount,
        razorpayOrderId: null,
      });

      const paymentResult = await PaymentService.createOrder(totalAmount, 'INR', order.id);
      if (!paymentResult.success) {
        return res.status(500).json({ success: false, error: paymentResult.error });
      }

      await OrderModel.updateRazorpayOrderId(order.id, paymentResult.order.id);

      return res.status(201).json({
        success: true,
        data: {
          orderId: order.id,
          razorpayOrderId: paymentResult.order.id,
          amount: totalAmount,
          currency: 'INR',
          keyId: config.razorpay.keyId,
        },
      });
    } catch (error) {
      console.error('Create order error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async verifyPayment(req, res) {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const order = await OrderModel.getById(orderId);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      if (order.user_id !== req.user.uid) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }
      if (order.payment_status === 'paid') {
        return res.status(200).json({ success: true, message: 'Payment already verified', data: { order } });
      }

      const isValid = PaymentService.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );
      if (!isValid) {
        return res.status(400).json({ success: false, error: 'Invalid payment signature' });
      }

      const updated = await OrderModel.updatePayment(
        orderId,
        razorpayPaymentId,
        razorpaySignature,
        'paid'
      );

      await CartModel.clear(req.user.uid);

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: { order: updated },
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getMyOrders(req, res) {
    try {
      const result = await OrderModel.getByUserId(req.user.uid, {
        limit: parseInt(req.query.limit, 10) || 20,
        offset: parseInt(req.query.offset, 10) || 0,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getOrderById(req, res) {
    try {
      const order = await OrderModel.getById(req.params.id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      if (order.user_id !== req.user.uid && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }
      return res.status(200).json({ success: true, data: { order } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};

module.exports = OrderController;
