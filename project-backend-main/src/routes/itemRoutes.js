const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateCreateItem, validateUpdateItem, validateUuidParam } = require('../validators/itemValidator');

// Public - list & view items (no college filter)
router.get('/', ItemController.getAll);
// Auth required - home feed (same college, exclude own); must be before /:id
router.get('/home/feed', authenticate, ItemController.getHomeFeed);
router.get('/:id', validateUuidParam('id'), ItemController.getById);

// Auth required
router.post('/', authenticate, validateCreateItem, ItemController.create);
router.get('/my/list', authenticate, ItemController.getMyItems);
router.put('/:id', authenticate, validateUuidParam('id'), validateUpdateItem, ItemController.update);
router.delete('/:id', authenticate, validateUuidParam('id'), ItemController.delete);

module.exports = router;
