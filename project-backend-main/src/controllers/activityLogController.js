const ActivityLogModel = require('../models/activityLogModel');

const ActivityLogController = {
  async getAll(req, res) {
    try {
      const result = await ActivityLogModel.getAll({
        limit: parseInt(req.query.limit, 10) || 50,
        offset: parseInt(req.query.offset, 10) || 0,
        userId: req.query.userId || null,
        status: req.query.status || null,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
        search: req.query.search || null,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await ActivityLogModel.getStats({
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
      });
      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};

module.exports = ActivityLogController;
