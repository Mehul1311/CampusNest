const db = require('../database');
const { v4: uuidv4 } = require('uuid');

const CategoryModel = {
  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);`,
      `CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);`,
    ];
    try {
      await db.query(createTableQuery);
      for (const q of indexQueries) {
        try { await db.query(q); } catch (e) { /* ignore */ }
      }
      // Seed default categories for campus marketplace
      const defaults = [
        { name: 'Books', slug: 'books', display_order: 1 },
        { name: 'Electronics', slug: 'electronics', display_order: 2 },
        { name: 'Furniture', slug: 'furniture', display_order: 3 },
        { name: 'Clothing', slug: 'clothing', display_order: 4 },
        { name: 'Sports', slug: 'sports', display_order: 5 },
        { name: 'Bikes', slug: 'bikes', display_order: 6 },
        { name: 'Stationery', slug: 'stationery', display_order: 7 },
        { name: 'Others', slug: 'others', display_order: 99 },
      ];
      for (const cat of defaults) {
        await db.query(
          `INSERT INTO categories (id, name, slug, display_order) 
           VALUES (gen_random_uuid(), $1, $2, $3)
           ON CONFLICT (slug) DO NOTHING`,
          [cat.name, cat.slug, cat.display_order]
        );
      }
      console.log('Categories table initialized');
    } catch (error) {
      console.error('Failed to initialize categories table:', error.message);
      throw error;
    }
  },

  async create(data) {
    const { name, slug, description = null, displayOrder = 0 } = data;
    const id = uuidv4();
    const s = slug || name.toLowerCase().replace(/\s+/g, '-');
    const query = `
      INSERT INTO categories (id, name, slug, description, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [id, name.trim(), s, description, displayOrder]);
    return result.rows[0];
  },

  async getAll() {
    const result = await db.query(
      'SELECT * FROM categories ORDER BY display_order ASC, name ASC'
    );
    return result.rows;
  },

  async getById(id) {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getBySlug(slug) {
    const result = await db.query('SELECT * FROM categories WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  },

  async update(id, updates) {
    const allowed = ['name', 'slug', 'description', 'display_order'];
    const setClause = [];
    const values = [];
    let i = 1;
    for (const [k, v] of Object.entries(updates)) {
      const f = k === 'displayOrder' ? 'display_order' : k;
      if (allowed.includes(f) && v !== undefined) {
        setClause.push(`${f} = $${i}`);
        values.push(v);
        i++;
      }
    }
    if (setClause.length === 0) return null;
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const query = `UPDATE categories SET ${setClause.join(', ')} WHERE id = $${i} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  },
};

module.exports = CategoryModel;
