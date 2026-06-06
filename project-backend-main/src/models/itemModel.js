const db = require('../database');
const { v4: uuidv4 } = require('uuid');

const ItemModel = {
  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        price DECIMAL(12, 2) NOT NULL,
        images TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'active' NOT NULL,
        college VARCHAR(255),
        contact_phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_items_seller ON items(seller_id);`,
      `CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);`,
      `CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);`,
      `CREATE INDEX IF NOT EXISTS idx_items_college ON items(college);`,
      `CREATE INDEX IF NOT EXISTS idx_items_created ON items(created_at DESC);`,
    ];
    try {
      await db.query(createTableQuery);
      for (const q of indexQueries) {
        try { await db.query(q); } catch (e) { /* ignore */ }
      }
      console.log('Items table initialized');
    } catch (error) {
      console.error('Failed to initialize items table:', error.message);
      throw error;
    }
  },

  async create(data) {
    const { sellerId, categoryId, title, description, price, images = [], college, contactPhone } = data;
    const id = uuidv4();
    const query = `
      INSERT INTO items (id, seller_id, category_id, title, description, price, images, college, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await db.query(query, [
      id, sellerId, categoryId, title.trim(), description || null, price,
      images.length ? images : [], college || null, contactPhone || null,
    ]);
    return result.rows[0];
  },

  async getForHome(options = {}) {
    const { userCollege, excludeSellerId, limit = 20, offset = 0, categoryId, search } = options;
    if (!userCollege || !excludeSellerId) {
      return { items: [], total: 0 };
    }
    const conditions = [
      "i.status = 'active'",
      "i.seller_id != $1",
      "(LOWER(TRIM(u.college)) = LOWER(TRIM($2)) OR LOWER(TRIM(i.college)) = LOWER(TRIM($2)))",
    ];
    const values = [excludeSellerId, userCollege];
    let i = 3;
    if (categoryId) {
      conditions.push(`i.category_id = $${i}`);
      values.push(categoryId);
      i++;
    }
    if (search) {
      conditions.push(`(i.title ILIKE $${i} OR i.description ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    const countValues = values.slice();
    values.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) FROM items i
      LEFT JOIN users u ON i.seller_id = u.uid
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count, 10);

    const query = `
      SELECT i.*, c.name as category_name, c.slug as category_slug,
             u.name as seller_name, u.college as seller_college
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN users u ON i.seller_id = u.uid
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const result = await db.query(query, values);
    return { items: result.rows, total };
  },

  async getAll(options = {}) {
    const { limit = 20, offset = 0, categoryId, status = 'active', college, search } = options;
    const conditions = [];
    const values = [];
    let i = 1;
    if (status) {
      conditions.push('i.status = $' + i);
      values.push(status);
      i++;
    }

    if (categoryId) {
      conditions.push(`i.category_id = $${i}`);
      values.push(categoryId);
      i++;
    }
    if (college) {
      conditions.push(`((i.college ILIKE $${i} OR u.college ILIKE $${i}) OR u.role IN ('admin', 'superadmin'))`);
      values.push(`%${college}%`);
      i++;
    }
    if (search) {
      conditions.push(`(i.title ILIKE $${i} OR i.description ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    values.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) FROM items i
      LEFT JOIN users u ON i.seller_id = u.uid
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const query = `
      SELECT i.*, c.name as category_name, c.slug as category_slug,
             u.name as seller_name, u.college as seller_college
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN users u ON i.seller_id = u.uid
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const result = await db.query(query, values);
    return { items: result.rows, total };
  },

  async getById(id) {
    const query = `
      SELECT i.*, c.name as category_name, c.slug as category_slug,
             u.name as seller_name, u.college as seller_college, u.phone as seller_phone
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN users u ON i.seller_id = u.uid
      WHERE i.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  async getBySellerId(sellerId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const countResult = await db.query(
      'SELECT COUNT(*) FROM items WHERE seller_id = $1',
      [sellerId]
    );
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await db.query(
      `SELECT i.*, c.name as category_name FROM items i
       LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.seller_id = $1 ORDER BY i.created_at DESC
       LIMIT $2 OFFSET $3`,
      [sellerId, limit, offset]
    );
    return { items: result.rows, total };
  },

  async update(id, updates, sellerId = null) {
    const allowed = ['title', 'description', 'price', 'images', 'status', 'college', 'contact_phone'];
    const setClause = [];
    const values = [];
    let i = 1;

    for (const [k, v] of Object.entries(updates)) {
      const f = k === 'contactPhone' ? 'contact_phone' : k;
      if (allowed.includes(f) && v !== undefined) {
        setClause.push(`${f} = $${i}`);
        values.push(Array.isArray(v) ? v : v);
        i++;
      }
    }
    if (setClause.length === 0) return null;

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    let query = `UPDATE items SET ${setClause.join(', ')} WHERE id = $${i}`;
    if (sellerId) {
      values.push(sellerId);
      i++;
      query += ` AND seller_id = $${i}`;
    }
    query += ' RETURNING *';

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id, sellerId = null) {
    let query = 'DELETE FROM items WHERE id = $1 RETURNING id';
    const params = [id];
    if (sellerId) {
      query = 'DELETE FROM items WHERE id = $1 AND seller_id = $2 RETURNING id';
      params.push(sellerId);
    }
    const result = await db.query(query, params);
    return result.rows.length > 0;
  },

  async updateStatus(id, status, sellerId = null) {
    return this.update(id, { status }, sellerId);
  },
};

module.exports = ItemModel;
