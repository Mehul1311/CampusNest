const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const ActivityLogController = require('../controllers/activityLogController');
const { authenticate, requireAdmin, requireSuperadmin } = require('../middleware/authMiddleware');

router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getAllUsers);
router.put('/users/:uid/role', requireSuperadmin, AdminController.updateUserRole);
router.get('/orders', AdminController.getAllOrders);
router.get('/activity-logs', ActivityLogController.getAll);
router.get('/activity-logs/stats', ActivityLogController.getStats);

module.exports = router;
