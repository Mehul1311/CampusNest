const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// Public - list categories and get by id
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Admin only - create/update/delete
router.post('/', authenticate, requireAdmin, CategoryController.create);
router.put('/:id', authenticate, requireAdmin, CategoryController.update);
router.delete('/:id', authenticate, requireAdmin, CategoryController.delete);

module.exports = router;
