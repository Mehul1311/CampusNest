const jwt = require('jsonwebtoken');
const config = require('../config');

const AUTH_ERROR_CODES = {
  NO_TOKEN: 'NO_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
};

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        errorCode: AUTH_ERROR_CODES.NO_TOKEN,
        error: 'Access denied. No token provided.',
      });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, errorCode: AUTH_ERROR_CODES.NO_TOKEN });
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        errorCode: AUTH_ERROR_CODES.TOKEN_EXPIRED,
        error: 'Token has expired',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        errorCode: AUTH_ERROR_CODES.TOKEN_INVALID,
        error: 'Invalid token',
      });
    }
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

const requireSuperadmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, error: 'Superadmin access required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireSuperadmin, AUTH_ERROR_CODES };
