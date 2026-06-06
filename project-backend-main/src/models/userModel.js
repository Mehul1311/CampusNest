const db = require('../database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 12;

const UserModel = {
  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        college VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        permissions TEXT[] DEFAULT '{}',
        is_verified BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const alterQueries = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;`,
      `UPDATE users SET role = 'user' WHERE role IS NULL OR role NOT IN ('user', 'admin', 'superadmin');`,
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role;`,
      `ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin', 'superadmin'));`,
    ];

    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
      `CREATE INDEX IF NOT EXISTS idx_users_college ON users(college);`,
      `CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);`,
    ];

    try {
      await db.query(createTableQuery);
      for (const q of alterQueries) {
        try { await db.query(q); } catch (e) { /* ignore */ }
      }
      for (const q of indexQueries) {
        try { await db.query(q); } catch (e) { /* ignore */ }
      }
      console.log('Users table initialized');
    } catch (error) {
      console.error('Failed to initialize users table:', error.message);
      throw error;
    }
  },

  async emailExists(email) {
    const result = await db.query('SELECT 1 FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]);
    return result.rows.length > 0;
  },

  async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    return result.rows[0] || null;
  },

  async findByUid(uid) {
    const result = await db.query('SELECT * FROM users WHERE uid = $1', [uid]);
    return result.rows[0] || null;
  },

  async findByFirebaseUid(firebaseUid) {
    const result = await db.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);
    return result.rows[0] || null;
  },

  async create(userData) {
    const { email, name = null, college, phone, password, role = 'user', firebaseUid = null } = userData;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const uid = uuidv4();

    const query = `
      INSERT INTO users (uid, email, name, college, phone, password, role, firebase_uid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING uid, email, name, college, phone, role, is_verified, created_at
    `;
    const result = await db.query(query, [uid, email.toLowerCase(), name, college, phone, hashedPassword, role, firebaseUid || null]);
    return result.rows[0];
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async updateFirebaseUid(uid, firebaseUid) {
    await db.query(
      'UPDATE users SET firebase_uid = $1, updated_at = CURRENT_TIMESTAMP WHERE uid = $2',
      [firebaseUid, uid]
    );
  },

  async updateByUid(uid, updates) {
    const allowedFields = ['name', 'college', 'phone', 'password', 'role', 'permissions', 'firebase_uid'];
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        let processedValue = value;
        if (key === 'password') processedValue = await bcrypt.hash(value, SALT_ROUNDS);
        setClause.push(`${key} = $${paramIndex}`);
        values.push(processedValue);
        paramIndex++;
      }
    }
    if (setClause.length === 0) return null;

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(uid);

    const query = `
      UPDATE users SET ${setClause.join(', ')}
      WHERE uid = $${paramIndex}
      RETURNING uid, email, name, college, phone, role, permissions, created_at, updated_at
    `;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async getAllUsers(options = {}) {
    const { limit = 50, offset = 0, role = null } = options;
    let whereClause = '';
    const values = [];
    let paramIndex = 1;

    if (role) {
      whereClause = `WHERE role = $${paramIndex}`;
      values.push(role);
      paramIndex++;
    }

    const countResult = await db.query(`SELECT COUNT(*) FROM users ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    const query = `
      SELECT uid, email, name, college, phone, role, permissions, is_verified, created_at, updated_at
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const result = await db.query(query, values);
    return { users: result.rows, total };
  },

  async updateRole(uid, role) {
    const query = `
      UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE uid = $2
      RETURNING uid, email, name, college, phone, role, permissions
    `;
    const result = await db.query(query, [role, uid]);
    return result.rows[0] || null;
  },
};

module.exports = UserModel;
