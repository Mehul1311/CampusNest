const ItemModel = require('../models/itemModel');
const CategoryModel = require('../models/categoryModel');
const UserModel = require('../models/userModel');
const config = require('../config');

const ItemController = {
  async create(req, res) {
    try {
      const { title, description, price, categoryId, images, college, contactPhone } = req.body;
      const userReq = req.user;
      const user = await UserModel.findByUid(userReq.uid);
      if (!user) return res.status(401).json({ success: false, error: 'User not found' });
      if (!user.college) return res.status(400).json({ success: false, error: 'College is required. Update your profile.' });

      const cat = await CategoryModel.getById(categoryId);
      if (!cat) return res.status(400).json({ success: false, error: 'Invalid category' });

      const item = await ItemModel.create({
        sellerId: user.uid,
        categoryId,
        title,
        description,
        price: parseFloat(price),
        images: images || [],
        college: college || user.college,
        contactPhone: contactPhone || user.phone,
      });

      return res.status(201).json({ success: true, data: { item } });
    } catch (error) {
      console.error('Create item error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getAll(req, res) {
    try {
      const { category, college, search, limit, offset } = req.query;
      const result = await ItemModel.getAll({
        categoryId: category,
        college,
        search,
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getHomeFeed(req, res) {
    try {
      const user = await UserModel.findByUid(req.user.uid);
      if (!user) return res.status(401).json({ success: false, error: 'User not found' });
      if (!user.college) {
        return res.status(400).json({ success: false, error: 'College is required. Update your profile to see items.' });
      }
      const { category, search, limit, offset } = req.query;
      const result = await ItemModel.getForHome({
        userCollege: user.college,
        excludeSellerId: req.user.uid,
        categoryId: category || null,
        search: search || null,
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
      });
      const feeMultiplier = 1 + (config.platform?.feePercent || 0.25);
      const items = result.items.map((row) => {
        const sellerPrice = parseFloat(row.price);
        const buyerPrice = Math.round(sellerPrice * feeMultiplier * 100) / 100;
        return {
          ...row,
          price: sellerPrice,
          buyer_price: buyerPrice,
        };
      });
      return res.status(200).json({ success: true, data: { items, total: result.total } });
    } catch (error) {
      console.error('Home feed error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getById(req, res) {
    try {
      const item = await ItemModel.getById(req.params.id);
      if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
      return res.status(200).json({ success: true, data: { item } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getMyItems(req, res) {
    try {
      const result = await ItemModel.getBySellerId(req.user.uid, {
        limit: parseInt(req.query.limit, 10) || 20,
        offset: parseInt(req.query.offset, 10) || 0,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async update(req, res) {
    try {
      const item = await ItemModel.getById(req.params.id);
      if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
      if (item.seller_id !== req.user.uid) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this item' });
      }

      const updated = await ItemModel.update(req.params.id, req.body, req.user.uid);
      return res.status(200).json({ success: true, data: { item: updated } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async delete(req, res) {
    try {
      const item = await ItemModel.getById(req.params.id);
      if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
      if (item.seller_id !== req.user.uid) {
        return res.status(403).json({ success: false, error: 'Not authorized to delete this item' });
      }

      await ItemModel.delete(req.params.id, req.user.uid);
      return res.status(200).json({ success: true, message: 'Item deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};

module.exports = ItemController;
