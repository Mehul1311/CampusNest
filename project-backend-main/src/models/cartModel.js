const db = require('../database');
const { v4: uuidv4 } = require('uuid');

const CartModel = {
  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS cart (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_id)
      );
    `;
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_cart_item ON cart(item_id);`,
    ];
    try {
      await db.query(createTableQuery);
      for (const q of indexQueries) {
        try { await db.query(q); } catch (e) { /* ignore */ }
      }
      console.log('Cart table initialized');
    } catch (error) {
      console.error('Failed to initialize cart table:', error.message);
      throw error;
    }
  },

  async add(userId, itemId, quantity = 1) {
    const query = `
      INSERT INTO cart (id, user_id, item_id, quantity)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
      RETURNING *
    `;
    const result = await db.query(query, [uuidv4(), userId, itemId, quantity]);
    return result.rows[0];
  },

  async getByUserId(userId) {
    const query = `
      SELECT c.*, i.title, i.price, i.images, i.status, i.seller_id,
             cat.name as category_name
      FROM cart c
      JOIN items i ON c.item_id = i.id
      JOIN categories cat ON i.category_id = cat.id
      WHERE c.user_id = $1 AND i.status = 'active'
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  async updateQuantity(userId, itemId, quantity) {
    if (quantity <= 0) return this.remove(userId, itemId);
    const query = `
      UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3 RETURNING *
    `;
    const result = await db.query(query, [quantity, userId, itemId]);
    return result.rows[0] || null;
  },

  async remove(userId, itemId) {
    const query = 'DELETE FROM cart WHERE user_id = $1 AND item_id = $2 RETURNING id';
    const result = await db.query(query, [userId, itemId]);
    return result.rows.length > 0;
  },

  async clear(userId) {
    const query = 'DELETE FROM cart WHERE user_id = $1';
    await db.query(query, [userId]);
    return true;
  },

  async getTotal(userId) {
    const rows = await this.getByUserId(userId);
    return rows.reduce((sum, r) => sum + parseFloat(r.price) * (r.quantity || 1), 0);
  },

  async countByUserId(userId) {
    const result = await db.query(
      'SELECT COUNT(*) FROM cart c JOIN items i ON c.item_id = i.id WHERE c.user_id = $1 AND i.status = $2',
      [userId, 'active']
    );
    return parseInt(result.rows[0].count, 10);
  },
};

module.exports = CartModel;
