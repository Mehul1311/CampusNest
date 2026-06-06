const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateCreateItem = [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 500 }),
  body('categoryId').notEmpty().withMessage('Category required').isUUID().withMessage('Invalid category'),
  body('price').notEmpty().withMessage('Price required').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('description').optional().trim(),
  body('images').optional().isArray(),
  body('college').optional().trim(),
  body('contactPhone').optional().trim(),
  handleValidationErrors,
];

const validateUpdateItem = [
  body('title').optional().trim().notEmpty().isLength({ max: 500 }),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('images').optional().isArray(),
  body('status').optional().isIn(['active', 'sold', 'inactive']),
  handleValidationErrors,
];

const validateUuidParam = (paramName) => [
  param(paramName).isUUID().withMessage('Invalid ID'),
  handleValidationErrors,
];

module.exports = { validateCreateItem, validateUpdateItem, validateUuidParam };
