const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT, 10) || 5432,
    name: process.env.PGDATABASE || 'campus_olx',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'campus-olx-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },

  platform: {
    feePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || '25', 10) / 100,
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
