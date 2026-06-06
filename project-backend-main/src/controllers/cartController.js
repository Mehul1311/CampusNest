const CartModel = require('../models/cartModel');
const ItemModel = require('../models/itemModel');
const UserModel = require('../models/userModel');
const config = require('../config');

const getBuyerPrice = (sellerPrice) => {
  const feeMultiplier = 1 + (config.platform?.feePercent || 0.25);
  return Math.round(parseFloat(sellerPrice) * feeMultiplier * 100) / 100;
};

const CartController = {
  async add(req, res) {
    try {
      const { itemId, quantity = 1 } = req.body;
      const item = await ItemModel.getById(itemId);
      if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
      if (item.status !== 'active') {
        return res.status(400).json({ success: false, error: 'Item is not available' });
      }
      if (item.seller_id === req.user.uid) {
        return res.status(400).json({ success: false, error: 'Cannot add your own item to cart' });
      }
      const buyer = await UserModel.findByUid(req.user.uid);
      if (!buyer || !buyer.college) {
        return res.status(400).json({ success: false, error: 'College is required' });
      }
      const sellerCollege = (item.seller_college || item.college || '').trim().toLowerCase();
      const buyerCollege = (buyer.college || '').trim().toLowerCase();
      if (sellerCollege !== buyerCollege) {
        return res.status(400).json({ success: false, error: 'You can only add items from your college' });
      }

      const cartItem = await CartModel.add(req.user.uid, itemId, parseInt(quantity, 10) || 1);
      return res.status(201).json({ success: true, data: { cartItem } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async get(req, res) {
    try {
      const rows = await CartModel.getByUserId(req.user.uid);
      const items = rows.map((r) => {
        const sellerPrice = parseFloat(r.price);
        const buyerPrice = getBuyerPrice(sellerPrice);
        return {
          ...r,
          price: sellerPrice,
          buyer_price: buyerPrice,
        };
      });
      const total = items.reduce((s, i) => s + (i.buyer_price || 0) * (i.quantity || 1), 0);
      return res.status(200).json({ success: true, data: { items, total: Math.round(total * 100) / 100 } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async updateQuantity(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      const q = parseInt(quantity, 10);
      if (isNaN(q) || q < 0) {
        return res.status(400).json({ success: false, error: 'Invalid quantity' });
      }

      if (q === 0) {
        await CartModel.remove(req.user.uid, itemId);
        return res.status(200).json({ success: true, message: 'Item removed from cart' });
      }

      const updated = await CartModel.updateQuantity(req.user.uid, itemId, q);
      if (!updated) return res.status(404).json({ success: false, error: 'Cart item not found' });
      return res.status(200).json({ success: true, data: { cartItem: updated } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async remove(req, res) {
    try {
      const removed = await CartModel.remove(req.user.uid, req.params.itemId);
      if (!removed) return res.status(404).json({ success: false, error: 'Cart item not found' });
      return res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async clear(req, res) {
    try {
      await CartModel.clear(req.user.uid);
      return res.status(200).json({ success: true, message: 'Cart cleared' });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};

module.exports = CartController;
