const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateSignup, validateLogin, validateFirebaseToken, validateGoogleSignup } = require('../validators/authValidator');

router.post('/signup', validateSignup, AuthController.signup);
router.post('/login', validateLogin, AuthController.login);
router.post('/firebase-login', validateFirebaseToken, AuthController.firebaseLogin);
router.post('/google-signup', validateGoogleSignup, AuthController.googleSignup);
router.get('/me', authenticate, AuthController.getProfile);

module.exports = router;
