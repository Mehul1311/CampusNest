const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance && config.razorpay.keyId && config.razorpay.keySecret) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};

const PaymentService = {
  createOrder(amount, currency = 'INR', receipt = null) {
    const rzp = getRazorpay();
    if (!rzp) {
      return { success: false, error: 'Razorpay not configured' };
    }
    return new Promise((resolve) => {
      rzp.orders.create(
        {
          amount: Math.round(amount * 100),
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
        },
        (err, order) => {
          if (err) resolve({ success: false, error: err.description || err.message });
          else resolve({ success: true, order });
        }
      );
    });
  },

  verifyPaymentSignature(orderId, paymentId, signature) {
    const secret = config.razorpay.keySecret;
    if (!secret) return false;
    const text = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(text).digest('hex');
    return expected === signature;
  },
};

module.exports = PaymentService;
