const db = require('../database');
const { v4: uuidv4 } = require('uuid');

const OrderModel = {
  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
        items JSONB NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        payment_status VARCHAR(30) DEFAULT 'pending' NOT NULL,
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_signature VARCHAR(255),
        shipping_address JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_razorpay ON orders(razorpay_order_id);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);`,
    ];
    try {
      await db.query(createTableQuery);
      for (const q of indexQueries) {
        try { await db.query(q); } catch (e) { /* ignore */ }
      }
      console.log('Orders table initialized');
    } catch (error) {
      console.error('Failed to initialize orders table:', error.message);
      throw error;
    }
  },

  async create(data) {
    const { userId, items, totalAmount, razorpayOrderId = null } = data;
    const id = uuidv4();
    const query = `
      INSERT INTO orders (id, user_id, items, total_amount, razorpay_order_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [
      id, userId, JSON.stringify(items), totalAmount, razorpayOrderId,
    ]);
    return result.rows[0];
  },

  async getById(id) {
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getByRazorpayOrderId(razorpayOrderId) {
    const result = await db.query('SELECT * FROM orders WHERE razorpay_order_id = $1', [razorpayOrderId]);
    return result.rows[0] || null;
  },

  async updateRazorpayOrderId(id, razorpayOrderId) {
    const query = `UPDATE orders SET razorpay_order_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
    const result = await db.query(query, [razorpayOrderId, id]);
    return result.rows[0] || null;
  },

  async getByUserId(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const countResult = await db.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [userId]);
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return { orders: result.rows, total };
  },

  async updatePayment(orderId, paymentId, signature, status = 'paid') {
    const query = `
      UPDATE orders
      SET razorpay_payment_id = $1, razorpay_signature = $2, payment_status = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 RETURNING *
    `;
    const result = await db.query(query, [paymentId, signature, status, orderId]);
    return result.rows[0] || null;
  },

  async getAll(options = {}) {
    const { limit = 50, offset = 0, status } = options;
    let whereClause = '';
    const values = [];
    let i = 1;
    if (status) {
      whereClause = 'WHERE payment_status = $1';
      values.push(status);
      i++;
    }
    const countResult = await db.query(`SELECT COUNT(*) FROM orders ${whereClause}`, values.slice(0, i - 1));
    const total = parseInt(countResult.rows[0].count, 10);
    values.push(limit, offset);
    const query = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o LEFT JOIN users u ON o.user_id = u.uid
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const result = await db.query(query, values);
    return { orders: result.rows, total };
  },

  async getStats() {
    const totalResult = await db.query('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = $1', ['paid']);
    const statusResult = await db.query(
      'SELECT payment_status, COUNT(*) as count FROM orders GROUP BY payment_status'
    );
    return {
      totalOrders: parseInt(totalResult.rows[0].count, 10),
      totalRevenue: parseFloat(totalResult.rows[0].total || 0),
      byStatus: statusResult.rows,
    };
  },
};

module.exports = OrderModel;
