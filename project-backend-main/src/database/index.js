const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

const getSSLConfig = () => {
  if (process.env.PGSSLMODE === 'disable') return false;
  if (process.env.PGSSLMODE === 'require' || process.env.PGSSLMODE === 'prefer') {
    return { rejectUnauthorized: false };
  }
  if (process.env.PGHOST && process.env.PGHOST !== 'localhost' && process.env.PGHOST !== '127.0.0.1') {
    return { rejectUnauthorized: false };
  }
  return false;
};

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT, 10) || 5432,
  database: process.env.PGDATABASE || 'campus_olx',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: getSSLConfig(),
});

pool.on('connect', () => console.log('Connected to PostgreSQL database'));
pool.on('error', (err) => console.error('PostgreSQL pool error:', err));

const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  testConnection: async () => {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Database connected at:', result.rows[0].now);
      return true;
    } catch (err) {
      console.error('Database connection failed:', err.message);
      return false;
    }
  },
  close: () => pool.end(),
};

module.exports = db;
