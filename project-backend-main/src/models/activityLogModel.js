const db = require('../database');
const { v4: uuidv4 } = require('uuid');

const ActivityLogModel = {
  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        user_email VARCHAR(255),
        user_role VARCHAR(50),
        activity_name VARCHAR(255) NOT NULL,
        activity_description TEXT,
        resource_type VARCHAR(100),
        resource_id VARCHAR(255),
        http_method VARCHAR(10),
        endpoint VARCHAR(500),
        status VARCHAR(20) DEFAULT 'success',
        status_code INTEGER,
        ip_address VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_status ON activity_logs(status);`,
    ];
    try {
      await db.query(createTableQuery);
      for (const q of indexQueries) {
        try { await db.query(q); } catch (e) { /* ignore */ }
      }
      console.log('Activity logs table initialized');
    } catch (error) {
      console.error('Failed to initialize activity_logs table:', error.message);
      throw error;
    }
  },

  async create(logData) {
    const {
      userId = null, userEmail = null, userRole = null, activityName,
      activityDescription = null, resourceType = null, resourceId = null,
      httpMethod = null, endpoint = null, status = 'success', statusCode = null,
      ipAddress = null,
    } = logData;

    const query = `
      INSERT INTO activity_logs (id, user_id, user_email, user_role, activity_name, activity_description,
        resource_type, resource_id, http_method, endpoint, status, status_code, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    try {
      const result = await db.query(query, [
        uuidv4(), userId, userEmail, userRole, activityName, activityDescription,
        resourceType, resourceId, httpMethod, endpoint, status, statusCode, ipAddress,
      ]);
      return result.rows[0];
    } catch (e) {
      console.error('Activity log error:', e.message);
      return null;
    }
  },

  async getAll(options = {}) {
    const { limit = 50, offset = 0, userId, status, startDate, endDate, search } = options;
    const conditions = [];
    const values = [];
    let i = 1;

    if (userId) { conditions.push(`user_id = $${i}`); values.push(userId); i++; }
    if (status) { conditions.push(`status = $${i}`); values.push(status); i++; }
    if (startDate) { conditions.push(`created_at >= $${i}`); values.push(startDate); i++; }
    if (endDate) { conditions.push(`created_at <= $${i}`); values.push(endDate); i++; }
    if (search) {
      conditions.push(`(activity_name ILIKE $${i} OR activity_description ILIKE $${i} OR user_email ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await db.query(`SELECT COUNT(*) FROM activity_logs ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    const query = `
      SELECT * FROM activity_logs ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const result = await db.query(query, values);
    return { logs: result.rows, total };
  },

  async getStats(options = {}) {
    const { startDate, endDate } = options;
    let whereClause = '';
    const values = [];
    if (startDate) { whereClause += ' AND created_at >= $1'; values.push(startDate); }
    if (endDate) { whereClause += ` AND created_at <= $${values.length + 1}`; values.push(endDate); }
    const where = whereClause ? `WHERE ${whereClause.replace(/^ AND /, '')}` : '';

    const totalResult = await db.query(`SELECT COUNT(*) as total FROM activity_logs ${where}`, values);
    const statusResult = await db.query(
      `SELECT status, COUNT(*) as count FROM activity_logs ${where} GROUP BY status`,
      values
    );
    const topUsers = await db.query(
      `SELECT user_email, user_role, COUNT(*) as count FROM activity_logs ${where}
       WHERE user_email IS NOT NULL GROUP BY user_email, user_role ORDER BY count DESC LIMIT 10`,
      values
    );

    return {
      total: parseInt(totalResult.rows[0].total, 10),
      byStatus: statusResult.rows,
      topUsers: topUsers.rows,
    };
  },
};

module.exports = ActivityLogModel;
