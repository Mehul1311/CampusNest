const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { verifyIdToken } = require('../services/firebaseAdmin');

const AuthController = {
  async signup(req, res) {
    try {
      const { email, name, college, phone, password } = req.body;

      if (await UserModel.emailExists(email)) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
      }

      const user = await UserModel.create({ email, name, college, phone, password });
      const token = jwt.sign(
        { uid: user.uid, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            name: user.name,
            college: user.college,
            phone: user.phone,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);

      if (!user || !(await UserModel.verifyPassword(password, user.password))) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { uid: user.uid, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            name: user.name,
            college: user.college,
            phone: user.phone,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async firebaseLogin(req, res) {
    try {
      const { idToken } = req.body;
      const decoded = await verifyIdToken(idToken);
      const firebaseUid = decoded.uid;
      const email = (decoded.email || '').toLowerCase();
      const name = decoded.name || decoded.email?.split('@')[0] || null;

      let user = await UserModel.findByFirebaseUid(firebaseUid);
      if (!user && email) user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Account not found. Please complete signup first with Google.',
          needsSignup: true,
        });
      }

      if (!user.firebase_uid) {
        await UserModel.updateFirebaseUid(user.uid, firebaseUid);
      }

      const token = jwt.sign(
        { uid: user.uid, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            name: user.name,
            college: user.college,
            phone: user.phone,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
      }
      console.error('Firebase login error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async googleSignup(req, res) {
    try {
      const { idToken, phone, college, password } = req.body;
      const decoded = await verifyIdToken(idToken);
      const firebaseUid = decoded.uid;
      const email = (decoded.email || '').toLowerCase();
      const name = decoded.name || decoded.email?.split('@')[0] || null;

      if (!email) {
        return res.status(400).json({ success: false, error: 'Google account email is required' });
      }

      if (await UserModel.emailExists(email)) {
        return res.status(400).json({ success: false, error: 'Email already registered. Please sign in.' });
      }

      const user = await UserModel.create({
        email,
        name,
        college,
        phone,
        password,
        firebaseUid,
      });

      const token = jwt.sign(
        { uid: user.uid, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            name: user.name,
            college: user.college,
            phone: user.phone,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
      }
      console.error('Google signup error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await UserModel.findByUid(req.user.uid);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      return res.status(200).json({
        success: true,
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            name: user.name,
            college: user.college,
            phone: user.phone,
            role: user.role,
            permissions: user.permissions || [],
          },
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};

module.exports = AuthController;
