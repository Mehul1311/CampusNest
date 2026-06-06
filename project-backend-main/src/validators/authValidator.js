const { body, validationResult } = require('express-validator');

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

const validateSignup = [
  body('email').trim().notEmpty().withMessage('Email required').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('name').trim().notEmpty().withMessage('Name required').isLength({ min: 2 }).withMessage('Name min 2 chars'),
  body('college').trim().notEmpty().withMessage('College required'),
  body('phone').trim().notEmpty().withMessage('Phone required').isLength({ min: 10 }).withMessage('Phone min 10 digits'),
  body('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password min 6 characters'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email required').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
  handleValidationErrors,
];

const validateFirebaseToken = [
  body('idToken').trim().notEmpty().withMessage('Firebase ID token required'),
  handleValidationErrors,
];

const validateGoogleSignup = [
  body('idToken').trim().notEmpty().withMessage('Firebase ID token required'),
  body('phone').trim().notEmpty().withMessage('Phone required').isLength({ min: 10 }).withMessage('Phone min 10 digits'),
  body('college').trim().notEmpty().withMessage('College required'),
  body('password').notEmpty().withMessage('Password required').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  handleValidationErrors,
];

module.exports = { validateSignup, validateLogin, validateFirebaseToken, validateGoogleSignup, handleValidationErrors };
