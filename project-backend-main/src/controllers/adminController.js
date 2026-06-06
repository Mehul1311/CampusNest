const UserModel = require('../models/userModel');
const OrderModel = require('../models/orderModel');
const ActivityLogModel = require('../models/activityLogModel');
const db = require('../database');

const AdminController = {
  async getStats(req, res) {
    try {
      const usersCount = await db.query('SELECT COUNT(*) as count FROM users');
      const categoriesCount = await db.query('SELECT COUNT(*) as count FROM categories');
      const orderStats = await OrderModel.getStats();
      const activityStats = await ActivityLogModel.getStats();

      return res.status(200).json({
        success: true,
        data: {
          users: parseInt(usersCount.rows[0].count, 10),
          categories: parseInt(categoriesCount.rows[0].count, 10),
          orders: orderStats,
          activityLogs: activityStats,
        },
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getAllUsers(req, res) {
    try {
      const result = await UserModel.getAllUsers({
        limit: parseInt(req.query.limit, 10) || 50,
        offset: parseInt(req.query.offset, 10) || 0,
        role: req.query.role || null,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async updateUserRole(req, res) {
    try {
      const { uid } = req.params;
      const { role } = req.body;
      const validRoles = ['user', 'admin', 'superadmin'];

      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ success: false, error: `Invalid role. Use: ${validRoles.join(', ')}` });
      }

      const user = await UserModel.updateRole(uid, role);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      return res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getAllOrders(req, res) {
    try {
      const result = await OrderModel.getAll({
        limit: parseInt(req.query.limit, 10) || 50,
        offset: parseInt(req.query.offset, 10) || 0,
        status: req.query.status || null,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};

module.exports = AdminController;
